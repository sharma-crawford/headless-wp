<?php
/**
 * Direct uploads: a file goes from the author's browser straight to WordPress.
 *
 * The web app sits behind a host that caps a request at about 4 MB, and the
 * builder's own upload route is reached through it. A song is a little more
 * than that. So the web app asks here for a ticket, on the author's behalf and
 * with their credentials, and the browser sends the file to the ticket's
 * address itself. The bytes never pass through the web app, so the only limit
 * left is this server's own upload limit.
 *
 * A ticket is a long random string, good for one upload of one file onto one
 * node, for a few minutes. It is stored hashed, deleted when used, and the
 * author's right to edit the programme is checked again when it is used, so
 * losing it costs a few minutes of one author's access to one node and nothing
 * more. Everything else about the file is the builder's own rules: the same
 * types, the same sniffing of the real type, the same protected directory
 * (pcle_authoring_store_upload()).
 *
 * @package Platform_CLE
 */

defined( 'ABSPATH' ) || exit;

/** How long a ticket lasts, in seconds. */
const PCLE_UPLOAD_TICKET_TTL = 300;

/**
 * Registers the two routes.
 */
function pcle_direct_upload_register_routes() {
	register_rest_route(
		'platform-cle/v1',
		'/authoring/nodes/(?P<id>\\d+)/upload-ticket',
		array(
			'methods'             => 'POST',
			'callback'            => 'pcle_direct_upload_issue_ticket',
			// The same gate as attaching a file the ordinary way.
			'permission_callback' => 'pcle_authoring_guard_node',
		)
	);

	register_rest_route(
		'platform-cle/v1',
		'/upload/(?P<ticket>[A-Za-z0-9]{40})',
		array(
			'methods'             => 'POST',
			'callback'            => 'pcle_direct_upload_receive',
			'permission_callback' => 'pcle_direct_upload_guard',
		)
	);
}
add_action( 'rest_api_init', 'pcle_direct_upload_register_routes' );

/**
 * Where a ticket is kept. Hashed, so reading the database does not yield a
 * usable ticket.
 *
 * @param string $ticket The ticket.
 * @return string Transient name.
 */
function pcle_direct_upload_key( $ticket ) {
	return 'pcle_upl_' . substr( hash( 'sha256', $ticket ), 0, 40 );
}

/**
 * POST /authoring/nodes/<id>/upload-ticket — a one-time address to send a file to.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function pcle_direct_upload_issue_ticket( $request ) {
	$node_id = (int) $request['id'];
	$ticket  = wp_generate_password( 40, false, false );

	set_transient(
		pcle_direct_upload_key( $ticket ),
		array(
			'node' => $node_id,
			'user' => get_current_user_id(),
		),
		PCLE_UPLOAD_TICKET_TTL
	);

	return rest_ensure_response(
		array(
			'url'        => rest_url( 'platform-cle/v1/upload/' . $ticket ),
			'expires_in' => PCLE_UPLOAD_TICKET_TTL,
			'max_bytes'  => (int) wp_max_upload_size(),
		)
	);
}

/**
 * Lets a request in if it carries a live ticket whose author may still edit.
 *
 * Acts as the ticket's author for the rest of the request, because the
 * builder's upload code and the attachment it creates belong to someone.
 *
 * @param WP_REST_Request $request Request.
 * @return true|WP_Error
 */
function pcle_direct_upload_guard( $request ) {
	$held = get_transient( pcle_direct_upload_key( (string) $request['ticket'] ) );

	if ( ! is_array( $held ) ) {
		return new WP_Error( 'pcle_upload_ticket_invalid', __( 'This upload link has expired. Try the upload again.', 'platform-cle' ), array( 'status' => 401 ) );
	}

	wp_set_current_user( (int) $held['user'] );

	$program_id = pcle_get_program_for_post( (int) $held['node'] );

	if ( ! $program_id || ! pcle_user_can_edit_program( $program_id ) ) {
		return new WP_Error( 'pcle_cannot_edit', __( 'You may not edit this programme.', 'platform-cle' ), array( 'status' => 403 ) );
	}

	return true;
}

/**
 * POST /upload/<ticket> — receives the file, once.
 *
 * The ticket is spent before the file is looked at, so a refused file needs a
 * new ticket rather than leaving this one open to be tried with anything.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function pcle_direct_upload_receive( $request ) {
	$key  = pcle_direct_upload_key( (string) $request['ticket'] );
	$held = get_transient( $key );

	delete_transient( $key );

	$files = $request->get_file_params();

	if ( ! is_array( $held ) || empty( $files['file'] ) ) {
		return new WP_Error( 'pcle_no_file', __( 'No file was sent.', 'platform-cle' ), array( 'status' => 400 ) );
	}

	return pcle_authoring_store_upload( (int) $held['node'], $files['file'] );
}
