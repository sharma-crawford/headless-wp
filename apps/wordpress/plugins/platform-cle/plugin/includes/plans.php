<?php
/**
 * Plans: ranked tiers that open programmes, and programmes sold on their own.
 *
 * The decisions (ROADMAP.md, "a professional platform, webinars and student
 * tiers"):
 *
 *   - Ranked. A plan has a rank; it opens every programme whose minimum rank
 *     is at or below its own. A programme with no minimum is in no plan.
 *   - Data, not code. Administrators create the plans — names, ranks,
 *     prices — and set each programme's minimum. Nothing here presumes how
 *     many plans there are or what they are called.
 *   - One gate. pcle_user_has_program() is "enrolled, or on a plan that
 *     covers it", and pcle_can_access_post() asks it. Nothing else decides.
 *   - A single purchase is an enrolment. Selling a programme on its own
 *     grants exactly what an administrator's enrolment grants, so until
 *     payment exists (phase 7) "granted by hand" is enrolling someone.
 *
 * Prices are labels ("$199 a year"), not amounts: nothing charges anyone yet,
 * and an amount with a currency is the payment provider's to hold.
 *
 * @package Platform_CLE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Option holding every plan. */
const PCLE_PLANS_OPTION = 'pcle_plans';

/** Programme meta: the lowest plan rank that opens it (absent = in no plan). */
const PCLE_PROGRAM_MIN_RANK_META = '_pcle_min_rank';

/** Programme meta: whether it is also sold on its own. */
const PCLE_PROGRAM_SOLD_ALONE_META = '_pcle_sold_alone';

/** Programme meta: its price on its own, as shown ("$49"). */
const PCLE_PROGRAM_PRICE_META = '_pcle_price_label';

/** User meta: the id of the plan they hold. */
const PCLE_USER_PLAN_META = '_pcle_plan';

/** User meta: the last day the plan holds ('Y-m-d'), absent = no end. */
const PCLE_USER_PLAN_UNTIL_META = '_pcle_plan_until';

/* =========================================================================
 * 1) PLANS
 * ========================================================================= */

/**
 * Every plan, lowest rank first.
 *
 * @return array<int,array{id:string,name:string,rank:int,price:string,description:string,features:string[]}>
 */
function pcle_get_plans() {
	$plans = get_option( PCLE_PLANS_OPTION, array() );
	$plans = is_array( $plans ) ? array_values( array_filter( $plans, 'is_array' ) ) : array();

	usort( $plans, fn( $a, $b ) => (int) $a['rank'] <=> (int) $b['rank'] );

	return $plans;
}

/**
 * One plan by id, or null.
 *
 * @param string $id Plan id.
 * @return array|null
 */
function pcle_get_plan( $id ) {
	foreach ( pcle_get_plans() as $plan ) {
		if ( $plan['id'] === (string) $id ) {
			return $plan;
		}
	}

	return null;
}

/**
 * Validates and normalises a plan from request input.
 *
 * @param array       $input  Fields: name, rank, price, description, features.
 * @param string|null $own_id The plan being edited, so its own rank is not "taken".
 * @return array|WP_Error Normalised fields (no id).
 */
function pcle_sanitize_plan( $input, $own_id = null ) {
	$name = trim( sanitize_text_field( (string) ( $input['name'] ?? '' ) ) );
	$rank = (int) ( $input['rank'] ?? 0 );

	if ( '' === $name ) {
		return new WP_Error( 'pcle_plan_invalid', __( 'A plan needs a name.', 'platform-cle' ), array( 'status' => 400 ) );
	}

	if ( $rank < 1 || $rank > 99 ) {
		return new WP_Error( 'pcle_plan_invalid', __( 'A plan\'s rank is a whole number from 1 to 99.', 'platform-cle' ), array( 'status' => 400 ) );
	}

	foreach ( pcle_get_plans() as $plan ) {
		if ( $plan['id'] !== $own_id && (int) $plan['rank'] === $rank ) {
			return new WP_Error(
				'pcle_plan_rank_taken',
				/* translators: 1: rank, 2: plan name. */
				sprintf( __( 'Rank %1$d is already %2$s. Each plan needs its own rank.', 'platform-cle' ), $rank, $plan['name'] ),
				array( 'status' => 409 )
			);
		}
	}

	$features = $input['features'] ?? array();

	if ( is_string( $features ) ) {
		$features = preg_split( '/\r\n|\r|\n/', $features );
	}

	return array(
		'name'        => mb_substr( $name, 0, 60 ),
		'rank'        => $rank,
		'price'       => mb_substr( trim( sanitize_text_field( (string) ( $input['price'] ?? '' ) ) ), 0, 60 ),
		'description' => mb_substr( trim( sanitize_textarea_field( (string) ( $input['description'] ?? '' ) ) ), 0, 400 ),
		'features'    => array_slice(
			array_values( array_filter( array_map( fn( $f ) => mb_substr( trim( sanitize_text_field( (string) $f ) ), 0, 120 ), (array) $features ) ) ),
			0,
			12
		),
	);
}

/**
 * Creates or updates a plan.
 *
 * @param array       $input Fields.
 * @param string|null $id    Existing plan id, or null to create.
 * @return array|WP_Error The saved plan.
 */
function pcle_save_plan( $input, $id = null ) {
	$plans = pcle_get_plans();

	if ( null !== $id && ! pcle_get_plan( $id ) ) {
		return new WP_Error( 'pcle_plan_not_found', __( 'No such plan.', 'platform-cle' ), array( 'status' => 404 ) );
	}

	$fields = pcle_sanitize_plan( $input, $id );

	if ( is_wp_error( $fields ) ) {
		return $fields;
	}

	if ( null === $id ) {
		$id = sanitize_title( $fields['name'] );
		$id = '' !== $id ? $id : 'plan';

		// Unique, and never a reuse of a deleted plan's id still held by someone.
		$base = $id;
		$n    = 2;
		while ( pcle_get_plan( $id ) || pcle_plan_holder_count( $id ) > 0 ) {
			$id = $base . '-' . $n++;
		}

		$plans[] = array( 'id' => $id ) + $fields;
	} else {
		foreach ( $plans as &$plan ) {
			if ( $plan['id'] === $id ) {
				$plan = array( 'id' => $id ) + $fields;
			}
		}
		unset( $plan );
	}

	update_option( PCLE_PLANS_OPTION, array_values( $plans ), false );

	return pcle_get_plan( $id );
}

/**
 * Deletes a plan. Whoever held it holds nothing, and their progress stays.
 *
 * @param string $id Plan id.
 * @return true|WP_Error
 */
function pcle_delete_plan( $id ) {
	if ( ! pcle_get_plan( $id ) ) {
		return new WP_Error( 'pcle_plan_not_found', __( 'No such plan.', 'platform-cle' ), array( 'status' => 404 ) );
	}

	update_option(
		PCLE_PLANS_OPTION,
		array_values( array_filter( pcle_get_plans(), fn( $plan ) => $plan['id'] !== $id ) ),
		false
	);

	// The meta would point at nothing; clearing it keeps "who holds what" honest.
	foreach ( get_users( array( 'meta_key' => PCLE_USER_PLAN_META, 'meta_value' => $id, 'fields' => 'ID' ) ) as $user_id ) { // phpcs:ignore WordPress.DB.SlowDBQuery
		delete_user_meta( (int) $user_id, PCLE_USER_PLAN_META );
		delete_user_meta( (int) $user_id, PCLE_USER_PLAN_UNTIL_META );
	}

	return true;
}

/**
 * How many people hold a plan (expired or not).
 *
 * @param string $id Plan id.
 * @return int
 */
function pcle_plan_holder_count( $id ) {
	return count( get_users( array( 'meta_key' => PCLE_USER_PLAN_META, 'meta_value' => (string) $id, 'fields' => 'ID' ) ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
}

/* =========================================================================
 * 2) WHAT A PROGRAMME IS IN
 * ========================================================================= */

/**
 * The lowest plan rank that opens a programme, or 0 when no plan does.
 *
 * @param int $program_id Programme ID.
 * @return int
 */
function pcle_get_program_min_rank( $program_id ) {
	return max( 0, (int) get_post_meta( (int) $program_id, PCLE_PROGRAM_MIN_RANK_META, true ) );
}

/**
 * The cheapest plan that opens a programme — the lowest-ranked one at or
 * above its minimum — or null.
 *
 * @param int $program_id Programme ID.
 * @return array|null
 */
function pcle_get_program_entry_plan( $program_id ) {
	$min = pcle_get_program_min_rank( $program_id );

	if ( ! $min ) {
		return null;
	}

	foreach ( pcle_get_plans() as $plan ) {
		if ( (int) $plan['rank'] >= $min ) {
			return $plan;
		}
	}

	return null;
}

/**
 * Sets what a programme is in, and whether it is sold on its own.
 *
 * Each argument left null is left alone.
 *
 * @param int         $program_id Programme ID.
 * @param int|null    $min_rank   Lowest rank that opens it; 0 = in no plan.
 * @param bool|null   $sold_alone Also sold on its own.
 * @param string|null $price      Its price on its own, as a label.
 */
function pcle_set_program_access( $program_id, $min_rank = null, $sold_alone = null, $price = null ) {
	if ( null !== $min_rank ) {
		$min_rank = max( 0, min( 99, (int) $min_rank ) );

		if ( $min_rank > 0 ) {
			update_post_meta( $program_id, PCLE_PROGRAM_MIN_RANK_META, $min_rank );
		} else {
			delete_post_meta( $program_id, PCLE_PROGRAM_MIN_RANK_META );
		}
	}

	if ( null !== $sold_alone ) {
		if ( $sold_alone ) {
			update_post_meta( $program_id, PCLE_PROGRAM_SOLD_ALONE_META, 1 );
		} else {
			delete_post_meta( $program_id, PCLE_PROGRAM_SOLD_ALONE_META );
		}
	}

	if ( null !== $price ) {
		$price = mb_substr( trim( sanitize_text_field( (string) $price ) ), 0, 60 );

		if ( '' !== $price ) {
			update_post_meta( $program_id, PCLE_PROGRAM_PRICE_META, $price );
		} else {
			delete_post_meta( $program_id, PCLE_PROGRAM_PRICE_META );
		}
	}
}

/**
 * How a programme can be had, for the catalogue and the builder.
 *
 * @param int $program_id Programme ID.
 * @return array{min_rank:int, plan:array|null, sold_alone:bool, price:string}
 */
function pcle_shape_program_access( $program_id ) {
	$entry = pcle_get_program_entry_plan( $program_id );

	return array(
		'min_rank'   => pcle_get_program_min_rank( $program_id ),
		'plan'       => $entry ? array(
			'id'   => $entry['id'],
			'name' => $entry['name'],
			'rank' => (int) $entry['rank'],
		) : null,
		'sold_alone' => (bool) get_post_meta( $program_id, PCLE_PROGRAM_SOLD_ALONE_META, true ),
		'price'      => (string) get_post_meta( $program_id, PCLE_PROGRAM_PRICE_META, true ),
	);
}

/* =========================================================================
 * 3) WHO HOLDS WHAT
 * ========================================================================= */

/**
 * The plan a user holds today, or null — none, ended, or since deleted.
 *
 * "Until" is inclusive and read in the site's timezone: a plan good until
 * 30 June opens content all of 30 June.
 *
 * @param int $user_id User ID (defaults to the current user).
 * @return array|null The plan, with 'until' added ('' for no end).
 */
function pcle_get_user_plan( $user_id = 0 ) {
	$user_id = $user_id ? (int) $user_id : get_current_user_id();

	if ( ! $user_id ) {
		return null;
	}

	$plan = pcle_get_plan( (string) get_user_meta( $user_id, PCLE_USER_PLAN_META, true ) );

	if ( ! $plan ) {
		return null;
	}

	$until = (string) get_user_meta( $user_id, PCLE_USER_PLAN_UNTIL_META, true );

	if ( '' !== $until && $until < wp_date( 'Y-m-d' ) ) {
		return null;
	}

	return $plan + array( 'until' => $until );
}

/**
 * Gives someone a plan, changes it, or takes it away.
 *
 * @param int    $user_id User ID.
 * @param string $plan_id Plan id, or '' to remove.
 * @param string $until   Last day 'Y-m-d', or '' for no end.
 * @return true|WP_Error
 */
function pcle_set_user_plan( $user_id, $plan_id, $until = '' ) {
	$user_id = (int) $user_id;

	if ( '' === (string) $plan_id ) {
		delete_user_meta( $user_id, PCLE_USER_PLAN_META );
		delete_user_meta( $user_id, PCLE_USER_PLAN_UNTIL_META );
		return true;
	}

	if ( ! pcle_get_plan( $plan_id ) ) {
		return new WP_Error( 'pcle_plan_not_found', __( 'No such plan.', 'platform-cle' ), array( 'status' => 404 ) );
	}

	$until = trim( (string) $until );

	if ( '' !== $until ) {
		$date = date_create_immutable_from_format( '!Y-m-d', $until, wp_timezone() );

		if ( ! $date || $date->format( 'Y-m-d' ) !== $until ) {
			return new WP_Error( 'pcle_plan_until_invalid', __( 'The end date must be a date, like 2027-06-30.', 'platform-cle' ), array( 'status' => 400 ) );
		}
	}

	update_user_meta( $user_id, PCLE_USER_PLAN_META, (string) $plan_id );

	if ( '' !== $until ) {
		update_user_meta( $user_id, PCLE_USER_PLAN_UNTIL_META, $until );
	} else {
		delete_user_meta( $user_id, PCLE_USER_PLAN_UNTIL_META );
	}

	return true;
}

/**
 * Whether a user's plan opens a programme.
 *
 * @param int $program_id Programme ID.
 * @param int $user_id    User ID (defaults to the current user).
 * @return bool
 */
function pcle_plan_covers_program( $program_id, $user_id = 0 ) {
	$min  = pcle_get_program_min_rank( $program_id );
	$plan = $min ? pcle_get_user_plan( $user_id ) : null;

	return $plan && (int) $plan['rank'] >= $min;
}

/**
 * THE question: may this user have this programme?
 *
 * Enrolled (by an administrator, or — in phase 7 — by buying it), or on a
 * plan that covers it. Everything that decides access asks this.
 *
 * @param int $program_id Programme ID.
 * @param int $user_id    User ID (defaults to the current user).
 * @return bool
 */
function pcle_user_has_program( $program_id, $user_id = 0 ) {
	return pcle_is_enrolled( $program_id, $user_id ) || pcle_plan_covers_program( $program_id, $user_id );
}

/**
 * Programmes a user's plan opens (published), as IDs.
 *
 * @param int $user_id User ID.
 * @return int[]
 */
function pcle_get_plan_program_ids( $user_id ) {
	$plan = pcle_get_user_plan( $user_id );

	if ( ! $plan ) {
		return array();
	}

	return array_map(
		'intval',
		get_posts(
			array(
				'post_type'   => 'pcle_program',
				'post_status' => 'publish',
				'numberposts' => -1,
				'fields'      => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_query'  => array(
					array(
						'key'     => PCLE_PROGRAM_MIN_RANK_META,
						'value'   => (int) $plan['rank'],
						'compare' => '<=',
						'type'    => 'NUMERIC',
					),
				),
			)
		)
	);
}

/**
 * Everyone whose current plan opens a programme.
 *
 * So the session reminder and the attendance sheet reach plan holders too:
 * a live webinar in a plan is theirs to attend.
 *
 * @param int $program_id Programme ID.
 * @return int[]
 */
function pcle_get_program_plan_holder_ids( $program_id ) {
	$min = pcle_get_program_min_rank( $program_id );

	if ( ! $min ) {
		return array();
	}

	$ids = array();

	foreach ( pcle_get_plans() as $plan ) {
		if ( (int) $plan['rank'] < $min ) {
			continue;
		}

		foreach ( get_users( array( 'meta_key' => PCLE_USER_PLAN_META, 'meta_value' => $plan['id'], 'fields' => 'ID' ) ) as $user_id ) { // phpcs:ignore WordPress.DB.SlowDBQuery
			// pcle_get_user_plan() applies the end date.
			if ( pcle_get_user_plan( (int) $user_id ) ) {
				$ids[] = (int) $user_id;
			}
		}
	}

	return array_values( array_unique( $ids ) );
}

/**
 * A user's plan for the API, or null.
 *
 * @param int $user_id User ID.
 * @return array|null
 */
function pcle_shape_user_plan( $user_id ) {
	$plan = pcle_get_user_plan( $user_id );

	return $plan ? array(
		'id'    => $plan['id'],
		'name'  => $plan['name'],
		'rank'  => (int) $plan['rank'],
		'until' => $plan['until'],
	) : null;
}

/* =========================================================================
 * 4) ROUTES
 * ========================================================================= */

/**
 * GET /plans (public), POST /plans, PATCH|DELETE /plans/<id>, PUT /people/<id>/plan.
 */
function pcle_register_plan_routes() {
	$admin = fn() => current_user_can( 'manage_options' );

	register_rest_route(
		'platform-cle/v1',
		'/plans',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'pcle_rest_get_plans',
				// The Pricing page is public; what is returned is what it shows.
				'permission_callback' => '__return_true',
			),
			array(
				'methods'             => 'POST',
				'callback'            => fn( $request ) => pcle_rest_plan_result( pcle_save_plan( $request->get_params() ) ),
				'permission_callback' => $admin,
			),
		)
	);

	register_rest_route(
		'platform-cle/v1',
		'/plans/(?P<id>[a-z0-9-]+)',
		array(
			array(
				'methods'             => 'PATCH',
				'callback'            => fn( $request ) => pcle_rest_plan_result( pcle_save_plan( $request->get_params(), (string) $request['id'] ) ),
				'permission_callback' => $admin,
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => function ( $request ) {
					$deleted = pcle_delete_plan( (string) $request['id'] );
					return is_wp_error( $deleted ) ? $deleted : rest_ensure_response( array( 'deleted' => true ) );
				},
				'permission_callback' => $admin,
			),
		)
	);

	register_rest_route(
		'platform-cle/v1',
		'/people/(?P<id>\d+)/plan',
		array(
			'methods'             => 'PUT',
			'callback'            => function ( $request ) {
				$user = get_userdata( (int) $request['id'] );

				if ( ! $user ) {
					return new WP_Error( 'pcle_not_found', __( 'No such person.', 'platform-cle' ), array( 'status' => 404 ) );
				}

				$set = pcle_set_user_plan( $user->ID, (string) $request['plan'], (string) $request['until'] );

				return is_wp_error( $set ) ? $set : rest_ensure_response( array( 'plan' => pcle_shape_user_plan( $user->ID ) ) );
			},
			'permission_callback' => $admin,
		)
	);
}
add_action( 'rest_api_init', 'pcle_register_plan_routes' );

/**
 * A saved plan as a response, or the refusal.
 *
 * @param array|WP_Error $plan Result of pcle_save_plan().
 * @return WP_REST_Response|WP_Error
 */
function pcle_rest_plan_result( $plan ) {
	return is_wp_error( $plan ) ? $plan : rest_ensure_response( pcle_shape_plan( $plan ) );
}

/**
 * A plan as the Pricing page and the Plans screen show it.
 *
 * How many published programmes it opens is counted, not stored: change a
 * programme's tier and every plan's count follows.
 *
 * @param array $plan Plan.
 * @return array
 */
function pcle_shape_plan( $plan ) {
	$programs = get_posts(
		array(
			'post_type'   => 'pcle_program',
			'post_status' => 'publish',
			'numberposts' => -1,
			'fields'      => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_query'  => array(
				array(
					'key'     => PCLE_PROGRAM_MIN_RANK_META,
					'value'   => (int) $plan['rank'],
					'compare' => '<=',
					'type'    => 'NUMERIC',
				),
			),
		)
	);

	$shaped = array(
		'id'          => $plan['id'],
		'name'        => $plan['name'],
		'rank'        => (int) $plan['rank'],
		'price'       => $plan['price'],
		'description' => $plan['description'],
		'features'    => $plan['features'],
		'programs'    => count( $programs ),
	);

	// Who holds it is an administrator's business, not the Pricing page's.
	if ( current_user_can( 'manage_options' ) ) {
		$shaped['holders'] = pcle_plan_holder_count( $plan['id'] );
	}

	return $shaped;
}

/**
 * GET /plans.
 *
 * @return WP_REST_Response
 */
function pcle_rest_get_plans() {
	return rest_ensure_response( array( 'plans' => array_map( 'pcle_shape_plan', pcle_get_plans() ) ) );
}
