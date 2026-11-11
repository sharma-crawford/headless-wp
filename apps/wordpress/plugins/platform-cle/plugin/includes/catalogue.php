<?php
/**
 * The public catalogue: what the platform offers, readable signed out.
 *
 * Everything else in this plugin is behind a login, and the audit's sharpest
 * lesson was how a guard written for one route is not a guard on its
 * neighbour. So the catalogue does not open any existing route. It is two
 * routes of its own, and each field they return is chosen here, by name:
 *
 *   - title, summary, format, topics, cover, credit hours, how much is in it,
 *     the date of its next live session, which plan opens it and what it
 *     costs on its own — and for one programme, the titles of its units and
 *     modules.
 *   - never a body, a model answer, a file, a quiz, a join link, a person.
 *
 * Only published programmes, and only published units and modules inside
 * them. A draft does not exist here.
 *
 * Also here: topics (a taxonomy on programmes), and covers — a published
 * programme's featured image is public, because a cover is chosen to be
 * shown to people who have not signed up yet.
 *
 * @package Platform_CLE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Taxonomy for grouping programmes in the catalogue. */
const PCLE_TOPIC_TAXONOMY = 'pcle_topic';

/* =========================================================================
 * 1) TOPICS
 * ========================================================================= */

/**
 * Registers topics on programmes.
 *
 * Not in /wp/v2: the catalogue route is the one public reading of them, and
 * the builder writes them through the authoring API.
 */
function pcle_register_topic_taxonomy() {
	register_taxonomy(
		PCLE_TOPIC_TAXONOMY,
		'pcle_program',
		array(
			'labels'            => array(
				'name'          => __( 'Topics', 'platform-cle' ),
				'singular_name' => __( 'Topic', 'platform-cle' ),
				'add_new_item'  => __( 'Add topic', 'platform-cle' ),
			),
			'public'            => false,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => false,
			'hierarchical'      => false,
			'rewrite'           => false,
			'capabilities'      => array(
				'manage_terms' => 'edit_pcle_contents',
				'edit_terms'   => 'edit_pcle_contents',
				'delete_terms' => 'edit_pcle_contents',
				'assign_terms' => 'edit_pcle_contents',
			),
		)
	);
}
add_action( 'init', 'pcle_register_topic_taxonomy' );

/**
 * A programme's topic names, alphabetically.
 *
 * @param int $program_id Programme ID.
 * @return string[]
 */
function pcle_get_program_topics( $program_id ) {
	$terms = get_the_terms( (int) $program_id, PCLE_TOPIC_TAXONOMY );

	if ( ! $terms || is_wp_error( $terms ) ) {
		return array();
	}

	$names = wp_list_pluck( $terms, 'name' );
	sort( $names, SORT_NATURAL | SORT_FLAG_CASE );

	return array_values( $names );
}

/**
 * Replaces a programme's topics from a list of names (or "a, b" text).
 *
 * @param int          $program_id Programme ID.
 * @param string|array $topics     Names.
 */
function pcle_set_program_topics( $program_id, $topics ) {
	if ( is_string( $topics ) ) {
		$topics = explode( ',', $topics );
	}

	$names = array_values(
		array_unique(
			array_filter(
				array_map(
					fn( $name ) => mb_substr( sanitize_text_field( (string) $name ), 0, 60 ),
					(array) $topics
				)
			)
		)
	);

	wp_set_object_terms( (int) $program_id, array_slice( $names, 0, 12 ), PCLE_TOPIC_TAXONOMY );
}

/* =========================================================================
 * 2) COVERS
 * ========================================================================= */

/**
 * Whether an attachment is the cover of a published programme.
 *
 * That, and only that, makes a protected file public: see the download
 * handler in protected-files.php. The programme has to be published at the
 * moment of the request, so unpublishing one takes its cover back.
 *
 * @param int $attachment_id Attachment ID.
 * @return bool
 */
function pcle_is_public_cover( $attachment_id ) {
	$attachment_id = (int) $attachment_id;

	if ( ! $attachment_id || ! wp_attachment_is_image( $attachment_id ) ) {
		return false;
	}

	$programs = get_posts(
		array(
			'post_type'   => 'pcle_program',
			'post_status' => 'publish',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_thumbnail_id', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $attachment_id, // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);

	return ! empty( $programs );
}

/**
 * A programme's cover URL, or null.
 *
 * The large size when there is one: the catalogue draws covers wide.
 *
 * @param int $program_id Programme ID.
 * @return string|null
 */
function pcle_get_program_cover_url( $program_id ) {
	$thumbnail = (int) get_post_thumbnail_id( (int) $program_id );

	if ( ! $thumbnail || ! wp_attachment_is_image( $thumbnail ) ) {
		return null;
	}

	/*
	 * A protected image's URL is the download endpoint, which serves the
	 * original file whatever size is asked for; an unprotected one has real
	 * sizes. Either way this is a URL a signed-out browser can load.
	 */
	$url = wp_get_attachment_image_url( $thumbnail, 'large' );

	return $url ? $url : null;
}

/**
 * Sets or clears a programme's cover.
 *
 * Only an image already attached to this programme (uploaded through the
 * builder onto it): a cover becomes public, and an author must not be able
 * to publish some other programme's file by naming its id.
 *
 * @param int $program_id    Programme ID.
 * @param int $attachment_id Image attached to it, or 0 to clear.
 * @return true|WP_Error
 */
function pcle_set_program_cover( $program_id, $attachment_id ) {
	$program_id    = (int) $program_id;
	$attachment_id = (int) $attachment_id;

	if ( 0 === $attachment_id ) {
		delete_post_thumbnail( $program_id );
		return true;
	}

	$attachment = get_post( $attachment_id );

	if (
		! $attachment
		|| 'attachment' !== $attachment->post_type
		|| (int) $attachment->post_parent !== $program_id
		|| ! wp_attachment_is_image( $attachment_id )
	) {
		return new WP_Error(
			'pcle_invalid_cover',
			__( 'A cover must be an image uploaded to this programme.', 'platform-cle' ),
			array( 'status' => 400 )
		);
	}

	set_post_thumbnail( $program_id, $attachment_id );

	return true;
}

/* =========================================================================
 * 3) THE ROUTES
 * ========================================================================= */

/**
 * Registers the two public catalogue routes.
 */
function pcle_register_catalogue_routes() {
	register_rest_route(
		'platform-cle/v1',
		'/catalogue',
		array(
			'methods'             => 'GET',
			'callback'            => 'pcle_rest_get_catalogue',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'platform-cle/v1',
		'/catalogue/(?P<id>\d+)',
		array(
			'methods'             => 'GET',
			'callback'            => 'pcle_rest_get_catalogue_item',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'pcle_register_catalogue_routes' );

/**
 * Every published programme, as a catalogue card.
 *
 * @return WP_REST_Response
 */
function pcle_rest_get_catalogue() {
	$programs = get_posts(
		array(
			'post_type'   => 'pcle_program',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array(
				'menu_order' => 'ASC',
				'title'      => 'ASC',
			),
		)
	);

	$items  = array_map( 'pcle_catalogue_shape', $programs );
	$topics = array();

	foreach ( $items as $item ) {
		$topics = array_merge( $topics, $item['topics'] );
	}

	$topics = array_values( array_unique( $topics ) );
	sort( $topics, SORT_NATURAL | SORT_FLAG_CASE );

	return rest_ensure_response(
		array(
			'programs' => $items,
			'topics'   => $topics,
		)
	);
}

/**
 * One published programme, with the titles of what is in it.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function pcle_rest_get_catalogue_item( $request ) {
	$program = get_post( (int) $request['id'] );

	// Not published is not found: a draft's existence is not public either.
	if ( ! $program || 'pcle_program' !== $program->post_type || 'publish' !== $program->post_status ) {
		return new WP_Error( 'pcle_not_found', __( 'No such programme.', 'platform-cle' ), array( 'status' => 404 ) );
	}

	$item = pcle_catalogue_shape( $program );

	// A webinar's one unit and module are not shown to anyone; nothing to outline.
	$item['outline'] = pcle_is_webinar( $program->ID )
		? array()
		: array_map(
			fn( $unit ) => array(
				'title'   => get_the_title( $unit ),
				'modules' => array_map( 'get_the_title', pcle_catalogue_published( pcle_get_modules( $unit->ID ) ) ),
			),
			pcle_catalogue_published( pcle_get_units( $program->ID ) )
		);

	return rest_ensure_response( $item );
}

/**
 * Only the published ones.
 *
 * pcle_get_children() widens its statuses while staff preview as a
 * participant; the catalogue must not follow it there.
 *
 * @param WP_Post[] $posts Posts.
 * @return WP_Post[]
 */
function pcle_catalogue_published( $posts ) {
	return array_values( array_filter( $posts, fn( $post ) => 'publish' === $post->post_status ) );
}

/**
 * A programme as the catalogue shows it. Every field is named here.
 *
 * @param WP_Post $program Published programme.
 * @return array
 */
function pcle_catalogue_shape( $program ) {
	$units   = pcle_catalogue_published( pcle_get_units( $program->ID ) );
	$modules = 0;
	$next    = '';
	$now     = time();

	foreach ( $units as $unit ) {
		$modules += count( pcle_catalogue_published( pcle_get_modules( $unit->ID ) ) );

		foreach ( pcle_catalogue_published( pcle_get_events( $unit->ID ) ) as $event ) {
			$raw = pcle_get_event_datetime( $event->ID );
			$at  = $raw ? date_create_immutable_from_format( 'Y-m-d H:i:s', $raw, wp_timezone() ) : false;

			if ( $at && $at->getTimestamp() + pcle_get_event_duration( $event->ID ) * MINUTE_IN_SECONDS >= $now ) {
				$iso = $at->format( DATE_ATOM );

				if ( '' === $next || strtotime( $iso ) < strtotime( $next ) ) {
					$next = $iso;
				}
			}
		}
	}

	$credits = array_values(
		array_filter(
			pcle_rest_shape_credit_hours( $program->ID ),
			fn( $credit ) => $credit['hours'] > 0
		)
	);

	return array(
		'id'        => (int) $program->ID,
		'title'     => get_the_title( $program ),
		'excerpt'   => pcle_rest_excerpt( $program ),
		'format'    => pcle_get_program_format( $program->ID ),
		'color'     => pcle_colours_shown_to_participants() ? pcle_get_colour( $program->ID ) : null,
		'cover'     => pcle_get_program_cover_url( $program->ID ),
		'topics'    => pcle_get_program_topics( $program->ID ),
		'credits'   => $credits,
		'units'     => count( $units ),
		'modules'   => $modules,
		'next_live' => $next,
		// The cheapest plan that opens it, and whether it is sold on its own (plans.php).
		'access'    => pcle_shape_program_access( $program->ID ),
	);
}
