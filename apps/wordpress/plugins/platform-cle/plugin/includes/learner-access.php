<?php
/**
 * How a learner gets in: the Armory web app, not WordPress.
 *
 * Learners use the Armory web app. WordPress is the back end they never see, but
 * its own emails (the set-password link, the enrolment notice) pointed at its
 * own login and its own front end, a different interface that asks for a
 * WordPress login. This file points them at the app instead:
 *
 *   - pcle_app_url(): where the app lives;
 *   - the new-account email: the app's set-password page, in plain words;
 *   - "forgot your password?": a public, enumeration-safe route that emails a
 *     link to the same page, and the route that page uses to set the password.
 *
 * The password is only ever chosen by its owner, on a page of the app, and the
 * link carries WordPress's own single-use reset key.
 *
 * @package Platform_CLE
 */

defined( 'ABSPATH' ) || exit;

/**
 * Where the Armory web app is served.
 *
 * Set PCLE_APP_URL in wp-config.php, or filter `pcle_app_url`. The fallback is
 * the production app, or the local dev server on a local install.
 *
 * @param string $path Optional path to append, e.g. '/my-training'.
 * @return string URL without a trailing slash, plus the path.
 */
function pcle_app_url( $path = '' ) {
	if ( defined( 'PCLE_APP_URL' ) && PCLE_APP_URL ) {
		$base = PCLE_APP_URL;
	} elseif ( in_array( wp_get_environment_type(), array( 'local', 'development' ), true ) ) {
		$base = 'http://localhost:3000';
	} else {
		$base = 'https://armory.thepen-and-swordkc.org';
	}

	$base = untrailingslashit( (string) apply_filters( 'pcle_app_url', $base ) );

	return $base . ( '' === $path ? '' : '/' . ltrim( $path, '/' ) );
}

/**
 * The link that lets someone set a new password in the app.
 *
 * @param WP_User $user User.
 * @return string|WP_Error URL, or the error from WordPress if no key could be made.
 */
function pcle_app_reset_url( $user ) {
	$key = get_password_reset_key( $user );

	if ( is_wp_error( $key ) ) {
		return $key;
	}

	return add_query_arg(
		array(
			'login' => rawurlencode( $user->user_login ),
			'key'   => $key,
		),
		pcle_app_url( '/reset-password' )
	);
}

/**
 * A friendly first word for a greeting: the display name, unless that is just
 * the login WordPress made from an email address.
 *
 * @param WP_User $user User.
 * @return string
 */
function pcle_greeting_name( $user ) {
	$name = trim( (string) $user->display_name );

	return ( '' === $name || 0 === strcasecmp( $name, $user->user_login ) ) ? '' : $name;
}

/* =========================================================================
 * 1) THE NEW-ACCOUNT EMAIL
 * ========================================================================= */

/**
 * Replaces WordPress's "Login Details" email for learners with one that sends
 * them to the app. Other roles keep WordPress's own.
 *
 * @param array   $email Email parts: to, subject, message, headers.
 * @param WP_User $user  New user.
 * @return array
 */
function pcle_new_learner_email( $email, $user ) {
	if ( ! in_array( 'pcle_student', (array) $user->roles, true ) ) {
		return $email;
	}

	$link = pcle_app_reset_url( $user );

	if ( is_wp_error( $link ) ) {
		return $email;
	}

	$name = pcle_greeting_name( $user );

	$email['subject'] = __( 'Your Pen & Sword Armory account', 'platform-cle' );
	$email['message'] = implode(
		"\n",
		array(
			'' === $name ? __( 'Hello,', 'platform-cle' ) : sprintf( /* translators: %s: name */ __( 'Hello %s,', 'platform-cle' ), $name ),
			'',
			__( 'An account has been made for you on the Pen & Sword Armory, where your training is.', 'platform-cle' ),
			'',
			__( 'Choose your password here:', 'platform-cle' ),
			$link,
			'',
			/* translators: %s: email address */
			sprintf( __( 'You sign in at %1$s with your email address (%2$s) and that password.', 'platform-cle' ), pcle_app_url( '/login' ), $user->user_email ),
			'',
			__( 'The link works once, and for a limited time. If it has run out, use "Forgot your password?" on the sign-in page.', 'platform-cle' ),
		)
	);

	return $email;
}
add_filter( 'wp_new_user_notification_email', 'pcle_new_learner_email', 10, 2 );

/* =========================================================================
 * 2) FORGOT AND RESET: PUBLIC ROUTES THE APP'S PAGES USE
 * ========================================================================= */

/**
 * Registers the two routes.
 */
function pcle_register_learner_access_routes() {
	register_rest_route(
		'platform-cle/v1',
		'/account/forgot',
		array(
			'methods'             => 'POST',
			'callback'            => 'pcle_rest_forgot_password',
			'permission_callback' => '__return_true',
			'args'                => array(
				'email' => array(
					'required' => true,
					'type'     => 'string',
				),
			),
		)
	);

	register_rest_route(
		'platform-cle/v1',
		'/account/reset',
		array(
			'methods'             => 'POST',
			'callback'            => 'pcle_rest_reset_password',
			'permission_callback' => '__return_true',
			'args'                => array(
				'login'    => array(
					'required' => true,
					'type'     => 'string',
				),
				'key'      => array(
					'required' => true,
					'type'     => 'string',
				),
				'password' => array(
					'required' => true,
					'type'     => 'string',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'pcle_register_learner_access_routes' );

/**
 * POST /account/forgot: emails a set-password link, if the address has an account.
 *
 * Always the same answer, so the route cannot be used to find out who has an
 * account. At most one email per address a minute, so it cannot be used to fill
 * someone's inbox either.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function pcle_rest_forgot_password( $request ) {
	$email = sanitize_email( (string) $request['email'] );
	$same  = rest_ensure_response( array( 'sent' => true ) );

	if ( ! is_email( $email ) ) {
		return $same;
	}

	$throttle = 'pcle_forgot_' . md5( strtolower( $email ) );

	if ( false !== get_transient( $throttle ) ) {
		return $same;
	}

	set_transient( $throttle, 1, MINUTE_IN_SECONDS );

	$user = get_user_by( 'email', $email );

	if ( ! $user ) {
		return $same;
	}

	$link = pcle_app_reset_url( $user );

	if ( is_wp_error( $link ) ) {
		return $same;
	}

	$name = pcle_greeting_name( $user );

	wp_mail(
		$user->user_email,
		__( 'Reset your Pen & Sword Armory password', 'platform-cle' ),
		implode(
			"\n",
			array(
				'' === $name ? __( 'Hello,', 'platform-cle' ) : sprintf( /* translators: %s: name */ __( 'Hello %s,', 'platform-cle' ), $name ),
				'',
				__( 'Someone asked to reset the password for this account. Choose a new one here:', 'platform-cle' ),
				$link,
				'',
				__( 'The link works once, and for a limited time. If it was not you, ignore this email: nothing changes.', 'platform-cle' ),
			)
		),
		pcle_email_headers()
	);

	return $same;
}

/**
 * POST /account/reset: sets the password, given a valid key from the emailed link.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function pcle_rest_reset_password( $request ) {
	$password = (string) $request['password'];
	$user     = check_password_reset_key( (string) $request['key'], (string) $request['login'] );

	if ( is_wp_error( $user ) ) {
		return new WP_Error(
			'pcle_reset_link_invalid',
			__( 'This link has expired or was already used. Ask for a new one.', 'platform-cle' ),
			array( 'status' => 400 )
		);
	}

	if ( strlen( $password ) < PCLE_MIN_PASSWORD_LENGTH ) {
		return new WP_Error(
			'pcle_password_short',
			/* translators: %d: minimum length */
			sprintf( __( 'A password is at least %d characters.', 'platform-cle' ), PCLE_MIN_PASSWORD_LENGTH ),
			array( 'status' => 400 )
		);
	}

	if ( 0 === strcasecmp( $password, $user->user_login ) || 0 === strcasecmp( $password, $user->user_email ) ) {
		return new WP_Error( 'pcle_password_guessable', __( 'A password cannot be your username or email address.', 'platform-cle' ), array( 'status' => 400 ) );
	}

	// Spends the key: it is cleared, so the link cannot be used twice.
	reset_password( $user, $password );

	// Whatever was signed in before this is signed out, as with any password change.
	update_user_meta( $user->ID, PCLE_TOKEN_GENERATION_META, pcle_token_generation( $user->ID ) + 1 );
	WP_Session_Tokens::get_instance( $user->ID )->destroy_all();

	return rest_ensure_response( array( 'changed' => true ) );
}
