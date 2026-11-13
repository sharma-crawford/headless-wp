<?php
/**
 * Schedule Event meta: session date and time, length, and where to join.
 *
 * Provides:
 *   - Registration of the `_pcle_event_datetime` meta (string 'Y-m-d H:i:s', in REST).
 *   - The join link and duration (deliberately NOT in REST: a join link is
 *     the session itself, and only the guarded participant routes hand it
 *     out — see pcle_rest_shape_event()).
 *   - A meta box with a datetime-local field on the event screen.
 *   - Secure save (nonce + capability + format validation).
 *   - Helpers to read/format the date respecting the site timezone.
 *
 * @package Platform_CLE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Meta key where we store the event date/time. */
const PCLE_EVENT_DATETIME_META = '_pcle_event_datetime';

/** Meta key for the conferencing link (Zoom, Teams, Meet…). */
const PCLE_EVENT_JOIN_URL_META = '_pcle_event_join_url';

/** Meta key for the session's length in minutes. */
const PCLE_EVENT_DURATION_META = '_pcle_event_duration';

/** How long a session is when nobody has said: the usual CLE hour. */
const PCLE_EVENT_DEFAULT_DURATION = 60;

/* =========================================================================
 * 1) META REGISTRATION
 * ========================================================================= */

/**
 * Registers the event date meta (exposed in REST).
 */
function pcle_register_event_meta() {
	register_post_meta(
		'pcle_event',
		PCLE_EVENT_DATETIME_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => true,
			'sanitize_callback' => 'pcle_sanitize_event_datetime',
			'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
				return current_user_can( 'edit_post', $post_id );
			},
		)
	);
}
add_action( 'init', 'pcle_register_event_meta' );

/**
 * Normalizes a date value to 'Y-m-d H:i:s' (or '' if invalid).
 *
 * Accepts both 'Y-m-d H:i:s' and the HTML5 input format 'Y-m-d\TH:i'.
 *
 * @param string $value Incoming value.
 * @return string
 */
function pcle_sanitize_event_datetime( $value ) {
	$value = trim( (string) $value );
	if ( '' === $value ) {
		return '';
	}

	// Normalize the datetime-local separator (T) to a space.
	$value = str_replace( 'T', ' ', $value );

	// If it comes without seconds (Y-m-d H:i), add them.
	if ( preg_match( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value ) ) {
		$value .= ':00';
	}

	$dt = date_create_from_format( 'Y-m-d H:i:s', $value, wp_timezone() );
	if ( ! $dt ) {
		return '';
	}

	// Reject overflowed values (e.g. month 13, day 99), which date_create_from_format
	// silently "corrects" instead of failing.
	$errors = date_get_last_errors();
	if ( $errors && ( $errors['warning_count'] || $errors['error_count'] ) ) {
		return '';
	}

	return $dt->format( 'Y-m-d H:i:s' );
}

/**
 * Normalises a join link to an https URL, or '' when it is not one.
 *
 * https only: the link is handed to every enrolled participant, and a
 * javascript: or plain-http link is not something to hand them.
 *
 * @param string $value Incoming value.
 * @return string
 */
function pcle_sanitize_event_join_url( $value ) {
	$value = trim( (string) $value );

	if ( '' === $value || 0 !== stripos( $value, 'https://' ) ) {
		return '';
	}

	return (string) esc_url_raw( $value, array( 'https' ) );
}

/**
 * Normalises a session length to whole minutes between 5 and 600, or 0
 * (meaning "not set", read back as the default).
 *
 * @param mixed $value Incoming value.
 * @return int
 */
function pcle_sanitize_event_duration( $value ) {
	$minutes = (int) $value;

	if ( $minutes <= 0 ) {
		return 0;
	}

	return max( 5, min( 600, $minutes ) );
}

/**
 * Writes a session's join link and length, deleting either when blank.
 *
 * The one writer, so wp-admin, the authoring API and a webinar's live
 * session all apply the same rules.
 *
 * @param int        $event_id Event ID.
 * @param string|null $join_url New link, or null to leave it alone.
 * @param mixed      $duration New length in minutes, or null to leave it alone.
 */
function pcle_set_event_details( $event_id, $join_url = null, $duration = null ) {
	if ( null !== $join_url ) {
		$url = pcle_sanitize_event_join_url( $join_url );

		if ( '' !== $url ) {
			update_post_meta( $event_id, PCLE_EVENT_JOIN_URL_META, $url );
		} else {
			delete_post_meta( $event_id, PCLE_EVENT_JOIN_URL_META );
		}
	}

	if ( null !== $duration ) {
		$minutes = pcle_sanitize_event_duration( $duration );

		if ( $minutes > 0 ) {
			update_post_meta( $event_id, PCLE_EVENT_DURATION_META, $minutes );
		} else {
			delete_post_meta( $event_id, PCLE_EVENT_DURATION_META );
		}
	}
}

/* =========================================================================
 * 2) META BOX
 * ========================================================================= */

/**
 * Adds the date meta box to the Schedule Event screen.
 */
function pcle_add_event_metabox() {
	add_meta_box(
		'pcle_event_datetime',
		__( 'Session Date & Time', 'platform-cle' ),
		'pcle_render_event_metabox',
		'pcle_event',
		'side',
		'high'
	);
}
add_action( 'add_meta_boxes', 'pcle_add_event_metabox' );

/**
 * Renders the datetime-local field.
 *
 * @param WP_Post $post Event being edited.
 */
function pcle_render_event_metabox( $post ) {
	$raw = (string) get_post_meta( $post->ID, PCLE_EVENT_DATETIME_META, true );

	// 'Y-m-d H:i:s' -> 'Y-m-d\TH:i' for the HTML5 input.
	$input_value = '';
	if ( '' !== $raw ) {
		$dt = date_create_from_format( 'Y-m-d H:i:s', $raw, wp_timezone() );
		if ( $dt ) {
			$input_value = $dt->format( 'Y-m-d\TH:i' );
		}
	}

	wp_nonce_field( 'pcle_save_event_datetime', 'pcle_event_datetime_nonce' );

	echo '<p>';
	printf(
		'<label for="pcle_event_datetime_field" class="screen-reader-text">%s</label>',
		esc_html__( 'Session date and time', 'platform-cle' )
	);
	printf(
		'<input type="datetime-local" id="pcle_event_datetime_field" name="pcle_event_datetime" value="%s" style="width:100%%;" />',
		esc_attr( $input_value )
	);
	echo '</p>';

	echo '<p class="description">';
	esc_html_e( 'Shown to students in the unit schedule. Uses the site timezone.', 'platform-cle' );
	echo '</p>';
	$join_url = pcle_get_event_join_url( $post->ID );
	$duration = (int) get_post_meta( $post->ID, PCLE_EVENT_DURATION_META, true );

	echo '<p>';
	printf(
		'<label for="pcle_event_duration_field">%s</label><br />',
		esc_html__( 'Length (minutes)', 'platform-cle' )
	);
	printf(
		'<input type="number" min="5" max="600" step="5" id="pcle_event_duration_field" name="pcle_event_duration" value="%s" placeholder="%d" style="width:100%%;" />',
		esc_attr( $duration ? (string) $duration : '' ),
		(int) PCLE_EVENT_DEFAULT_DURATION
	);
	echo '</p>';

	echo '<p>';
	printf(
		'<label for="pcle_event_join_url_field">%s</label><br />',
		esc_html__( 'Join link (https)', 'platform-cle' )
	);
	printf(
		'<input type="url" id="pcle_event_join_url_field" name="pcle_event_join_url" value="%s" placeholder="https://" style="width:100%%;" />',
		esc_attr( $join_url )
	);
	echo '</p>';

	echo '<p class="description">';
	esc_html_e( 'Zoom, Teams or Meet. Only enrolled participants are given it.', 'platform-cle' );
	echo '</p>';
}

/* =========================================================================
 * 3) SECURE SAVE
 * ========================================================================= */

/**
 * Saves the event date.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    The post object.
 */
function pcle_save_event_datetime( $post_id, $post ) {
	if ( 'pcle_event' !== $post->post_type ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	// Nonce: if our field isn't present, it's not our form.
	if ( ! isset( $_POST['pcle_event_datetime_nonce'] )
		|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pcle_event_datetime_nonce'] ) ), 'pcle_save_event_datetime' )
	) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$value = isset( $_POST['pcle_event_datetime'] )
		? pcle_sanitize_event_datetime( wp_unslash( $_POST['pcle_event_datetime'] ) )
		: '';

	if ( '' !== $value ) {
		update_post_meta( $post_id, PCLE_EVENT_DATETIME_META, $value );
	} else {
		delete_post_meta( $post_id, PCLE_EVENT_DATETIME_META );
	}
	pcle_set_event_details(
		$post_id,
		isset( $_POST['pcle_event_join_url'] ) ? sanitize_text_field( wp_unslash( $_POST['pcle_event_join_url'] ) ) : null,
		isset( $_POST['pcle_event_duration'] ) ? sanitize_text_field( wp_unslash( $_POST['pcle_event_duration'] ) ) : null
	);
}
add_action( 'save_post', 'pcle_save_event_datetime', 10, 2 );

/* =========================================================================
 * 4) READ / FORMAT HELPERS
 * ========================================================================= */

/**
 * Returns the event's raw date ('Y-m-d H:i:s') or ''.
 *
 * @param int $event_id Event ID.
 * @return string
 */
function pcle_get_event_datetime( $event_id ) {
	return (string) get_post_meta( $event_id, PCLE_EVENT_DATETIME_META, true );
}

/**
 * Returns the event's date formatted per the site settings.
 *
 * @param int    $event_id Event ID.
 * @param string $format   Optional format; defaults to the site's date + time.
 * @return string Empty string if there is no date.
 */
function pcle_format_event_datetime( $event_id, $format = '' ) {
	$raw = pcle_get_event_datetime( $event_id );
	if ( '' === $raw ) {
		return '';
	}

	$dt = date_create_from_format( 'Y-m-d H:i:s', $raw, wp_timezone() );
	if ( ! $dt ) {
		return '';
	}

	if ( '' === $format ) {
		$format = get_option( 'date_format' ) . ' · ' . get_option( 'time_format' );
	}

	// wp_date respects the site timezone and translation.
	return wp_date( $format, $dt->getTimestamp() );
}

/**
 * The session's join link, or ''.
 *
 * @param int $event_id Event ID.
 * @return string
 */
function pcle_get_event_join_url( $event_id ) {
	return (string) get_post_meta( $event_id, PCLE_EVENT_JOIN_URL_META, true );
}

/**
 * The session's length in minutes, the default when unset.
 *
 * @param int $event_id Event ID.
 * @return int
 */
function pcle_get_event_duration( $event_id ) {
	$minutes = (int) get_post_meta( $event_id, PCLE_EVENT_DURATION_META, true );

	return $minutes > 0 ? $minutes : PCLE_EVENT_DEFAULT_DURATION;
}
