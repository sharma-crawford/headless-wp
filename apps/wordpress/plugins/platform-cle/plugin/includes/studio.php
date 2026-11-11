<?php
/**
 * What the builder tells an author about a programme at a glance.
 *
 * Two things, both computed and never stored:
 *
 *   - The "ready to publish" checklist: what a participant would meet that
 *     is missing or unfinished. Advice, not a gate — publishing is never
 *     refused for it, because the author may know better (a programme with
 *     no credit hours yet can still be worth running).
 *   - The cohort's size and how far through it they are, on average.
 *
 * @package Platform_CLE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The ready-to-publish checklist for a programme.
 *
 * Reads every status, because the point is to find what is still a draft.
 * Each item: key, label, done, and — when something specific needs looking
 * at — the id of the first item to open.
 *
 * @param int $program_id Programme ID.
 * @return array<int,array{key:string,label:string,done:bool,node_id:int}>
 */
function pcle_program_checklist( $program_id ) {
	$program_id  = (int) $program_id;
	$descendants = pcle_authoring_descendants( $program_id );
	$by_type     = array();

	foreach ( $descendants as $post ) {
		$by_type[ $post->post_type ][] = $post;
	}

	$modules = $by_type['pcle_module'] ?? array();
	$quizzes = $by_type['pcle_quiz'] ?? array();
	$webinar = pcle_is_webinar( $program_id );

	$items = array();

	$items[] = array(
		'key'     => 'summary',
		'label'   => __( 'Summary written', 'platform-cle' ),
		'done'    => '' !== trim( pcle_rest_excerpt( get_post( $program_id ) ) ),
		'node_id' => 0,
	);

	// A webinar's module is its video page: it needs a body, not a count.
	if ( $webinar ) {
		$empty = array_values( array_filter( $modules, fn( $m ) => '' === trim( $m->post_content ) ) );
		$items[] = array(
			'key'     => 'content',
			'label'   => __( 'Video and description added', 'platform-cle' ),
			'done'    => $modules && ! $empty,
			'node_id' => $empty ? (int) $empty[0]->ID : 0,
		);
	} else {
		$items[] = array(
			'key'     => 'content',
			'label'   => __( 'At least one module', 'platform-cle' ),
			'done'    => count( $modules ) > 0,
			'node_id' => 0,
		);
	}

	$items[] = array(
		'key'     => 'credits',
		'label'   => __( 'Credit hours entered', 'platform-cle' ),
		'done'    => pcle_has_credit_hours( $program_id ),
		'node_id' => 0,
	);

	$empty_quiz = array_values( array_filter( $quizzes, fn( $q ) => 0 === count( pcle_get_quiz_questions( $q->ID ) ) ) );
	$items[]    = array(
		'key'     => 'quizzes',
		'label'   => $quizzes ? __( 'Quizzes have questions', 'platform-cle' ) : __( 'No quizzes to check', 'platform-cle' ),
		'done'    => ! $empty_quiz,
		'node_id' => $empty_quiz ? (int) $empty_quiz[0]->ID : 0,
	);

	// The hidden unit of a webinar follows the programme; it is not the author's to publish.
	$drafts = array_values(
		array_filter(
			$descendants,
			fn( $post ) => 'publish' !== $post->post_status
				&& ! ( $webinar && in_array( $post->post_type, array( 'pcle_unit', 'pcle_module', 'pcle_event' ), true ) )
		)
	);
	$items[] = array(
		'key'     => 'drafts',
		'label'   => $drafts
			/* translators: %d: number of items still in draft. */
			? sprintf( _n( '%d item still a draft', '%d items still drafts', count( $drafts ), 'platform-cle' ), count( $drafts ) )
			: __( 'Everything inside is published', 'platform-cle' ),
		'done'    => ! $drafts,
		'node_id' => $drafts ? (int) $drafts[0]->ID : 0,
	);

	$items[] = array(
		'key'     => 'cover',
		'label'   => __( 'Cover image', 'platform-cle' ),
		'done'    => null !== pcle_get_program_cover_url( $program_id ),
		'node_id' => 0,
	);

	return $items;
}

/**
 * Who the programme's cohort is and how far through it they are.
 *
 * Participants: enrolled, or on a plan that opens it. The average is of
 * those with the programme, over its published modules.
 *
 * @param int $program_id Programme ID.
 * @return array{participants:int, percent:int}
 */
function pcle_program_cohort( $program_id ) {
	$ids = array_values(
		array_unique(
			array_merge( pcle_get_program_enrollee_ids( $program_id ), pcle_get_program_plan_holder_ids( $program_id ) )
		)
	);

	if ( ! $ids ) {
		return array(
			'participants' => 0,
			'percent'      => 0,
		);
	}

	$total = 0;

	foreach ( $ids as $user_id ) {
		$total += (int) pcle_get_program_progress( $program_id, $user_id )['percent'];
	}

	return array(
		'participants' => count( $ids ),
		'percent'      => (int) round( $total / count( $ids ) ),
	);
}
