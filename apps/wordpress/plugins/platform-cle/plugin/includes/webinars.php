<?php
/**
 * Webinars: live sessions and recordings, gathered in one place.
 *
 * Two things live here.
 *
 * 1. A webinar's live session. A webinar programme is one unit holding one
 *    module (formats.php), and the author never sees that unit. To give a
 *    webinar a date and a join link, the programme carries them, and they
 *    are stored on an ordinary Schedule Event inside that hidden unit — so
 *    the session reminder, attendance, the cohort report and the credit
 *    record treat a live webinar exactly as they treat a series' session,
 *    with no second implementation of any of them.
 *
 * 2. GET /platform-cle/v1/webinars: what the webinars hub shows the reader.
 *    Upcoming sessions from every programme they can see, series and
 *    webinars alike, and the webinars they can watch on demand.
 *
 * @package Platform_CLE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* =========================================================================
 * 1) A WEBINAR'S LIVE SESSION
 * ========================================================================= */

/**
 * The Schedule Event standing for a webinar's live session, or 0.
 *
 * Any status: the author sets the date while the webinar is still a draft.
 *
 * @param int $program_id Programme ID.
 * @return int
 */
function pcle_get_webinar_event_id( $program_id ) {
	if ( ! pcle_is_webinar( $program_id ) ) {
		return 0;
	}

	foreach ( pcle_authoring_get_children( $program_id, 'pcle_unit' ) as $unit ) {
		$events = pcle_authoring_get_children( $unit->ID, 'pcle_event' );

		if ( $events ) {
			return (int) $events[0]->ID;
		}
	}

	return 0;
}

/**
 * Sets, changes or clears a webinar's live session.
 *
 * Each argument left null is left alone, so a client changing only the join
 * link does not clear the date. Clearing the date removes the session —
 * unless someone has already been marked as attending it, because that
 * record may stand behind a credit claim; then only the date is cleared.
 *
 * @param int         $program_id Programme ID (a webinar).
 * @param string|null $starts_at  'Y-m-d H:i[:s]' or 'Y-m-d\TH:i', '' to clear.
 * @param mixed       $duration   Minutes, or null.
 * @param string|null $join_url   https link, '' to clear, or null.
 * @return true|WP_Error
 */
function pcle_set_webinar_live( $program_id, $starts_at = null, $duration = null, $join_url = null ) {
	$program_id = (int) $program_id;

	if ( ! pcle_is_webinar( $program_id ) ) {
		return new WP_Error(
			'pcle_not_webinar',
			__( 'Only a webinar has a live session of its own. A series schedules sessions inside its units.', 'platform-cle' ),
			array( 'status' => 409 )
		);
	}

	$event_id = pcle_get_webinar_event_id( $program_id );
	$date     = null === $starts_at ? null : pcle_sanitize_event_datetime( (string) $starts_at );

	if ( '' === $date ) {
		if ( $event_id ) {
			if ( pcle_get_event_attendee_ids( $event_id ) ) {
				delete_post_meta( $event_id, PCLE_EVENT_DATETIME_META );
			} else {
				wp_delete_post( $event_id, true );
			}
		}

		return true;
	}

	if ( ! $event_id ) {
		if ( null === $date ) {
			// A link or a length with no session to put it on: nothing to do.
			return true;
		}

		$units = pcle_authoring_get_children( $program_id, 'pcle_unit' );

		if ( ! $units ) {
			return new WP_Error( 'pcle_webinar_shape', __( 'This webinar has no unit to hold its session.', 'platform-cle' ), array( 'status' => 409 ) );
		}

		$event_id = wp_insert_post(
			array(
				'post_type'   => 'pcle_event',
				/* translators: %s: webinar title. */
				'post_title'  => sprintf( __( '%s — live', 'platform-cle' ), get_the_title( $program_id ) ),
				'post_status' => get_post_status( $program_id ),
				'menu_order'  => 1,
				'meta_input'  => array( '_pcle_unit_id' => (int) $units[0]->ID ),
			),
			true
		);

		if ( is_wp_error( $event_id ) ) {
			return new WP_Error( 'pcle_create_failed', $event_id->get_error_message(), array( 'status' => 500 ) );
		}
	}

	if ( null !== $date ) {
		update_post_meta( $event_id, PCLE_EVENT_DATETIME_META, $date );
	}

	pcle_set_event_details( $event_id, $join_url, $duration );

	return true;
}

/**
 * A webinar's live session as the builder edits it, or null.
 *
 * @param int $program_id Programme ID.
 * @return array|null
 */
function pcle_shape_webinar_live( $program_id ) {
	$event_id = pcle_get_webinar_event_id( $program_id );

	if ( ! $event_id ) {
		return null;
	}

	return array(
		'event_id'  => $event_id,
		'starts_at' => pcle_get_event_datetime( $event_id ),
		'duration'  => pcle_get_event_duration( $event_id ),
		'join_url'  => pcle_get_event_join_url( $event_id ),
	);
}

/* =========================================================================
 * 2) THE HUB
 * ========================================================================= */

/**
 * Registers GET /platform-cle/v1/webinars.
 */
function pcle_register_webinars_route() {
	register_rest_route(
		'platform-cle/v1',
		'/webinars',
		array(
			'methods'             => 'GET',
			'callback'            => 'pcle_rest_get_webinars',
			'permission_callback' => function () {
				return is_user_logged_in() && current_user_can( 'view_cle_content' );
			},
		)
	);
}
add_action( 'rest_api_init', 'pcle_register_webinars_route' );

/**
 * REST callback: upcoming sessions and on-demand webinars for this reader.
 *
 * Built only from pcle_get_visible_programs(), the same set My Training
 * lists, so the hub can never offer a session — or its join link — from a
 * programme the reader could not open.
 *
 * "Upcoming" includes a session still running: it stays listed until its
 * length has passed, which is when "Join" stops being useful.
 *
 * A webinar is "on demand" once it has no session still to come: before
 * its live date the module holds, at most, a placeholder for the recording.
 *
 * @return WP_REST_Response
 */
function pcle_rest_get_webinars() {
	$now       = time();
	$upcoming  = array();
	$on_demand = array();

	foreach ( pcle_get_visible_programs() as $program ) {
		$is_webinar = pcle_is_webinar( $program->ID );
		$still_live = false;

		foreach ( pcle_get_units( $program->ID ) as $unit ) {
			foreach ( pcle_get_events( $unit->ID ) as $event ) {
				$shaped = pcle_rest_shape_event( $event );

				if ( '' === $shaped['ends_at'] || strtotime( $shaped['ends_at'] ) < $now ) {
					continue;
				}

				$still_live = true;

				$upcoming[] = $shaped + array(
					'program' => array(
						'id'     => (int) $program->ID,
						'title'  => get_the_title( $program ),
						'format' => pcle_get_program_format( $program->ID ),
						'color'  => pcle_participant_colour( $program->ID ),
					),
					// Where "details" leads: the video page for a webinar, the unit for a series.
					'href'    => $is_webinar
						? '/modules/' . pcle_get_webinar_module_id( $program->ID )
						: '/units/' . (int) $unit->ID,
				);
			}
		}

		if ( $is_webinar && ! $still_live && pcle_get_webinar_module_id( $program->ID ) ) {
			$on_demand[] = pcle_rest_shape_training_program( $program );
		}
	}

	usort(
		$upcoming,
		fn( $a, $b ) => strtotime( $a['starts_at'] ) <=> strtotime( $b['starts_at'] )
	);

	return rest_ensure_response(
		array(
			'upcoming'  => $upcoming,
			'on_demand' => $on_demand,
			'now'       => gmdate( DATE_ATOM, $now ),
		)
	);
}
