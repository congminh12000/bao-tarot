<?php get_header(); ?>

<?php if( get_option('nicdark_type_demo') == 1 ){ the_content(); }else{ ?>


<?php

if ( get_header_image() != '' ) {
	$nicdark_archive_header_image_class = 'nicdark_header_img_archive_exist';
}else{
	$nicdark_archive_header_image_class = '';
}

?>


<!--start section-->
<div style="background-image:url(<?php echo esc_url(get_header_image()); ?>)" id="nicdark_header_img_archive" class="nicdark_section nicdark_border_bottom_1_solid_grey <?php echo esc_attr($nicdark_archive_header_image_class); ?>">

    <!--start nicdark_container-->
    <div class="nicdark_container nicdark_clearfix">

    	<div class="nicdark_grid_12">

    		<div class="nicdark_section nicdark_height_140"></div>

    		
				<h1 class="nicdark_font_size_112 nicdark_font_size_40_all_iphone nicdark_line_height_40_all_iphone nicdark_text_align_center nicdark_font_weight_600"><?php esc_html_e('Search for','taroti'); ?></h1>
				<div class="nicdark_section nicdark_height_30"></div>
				<h4 class="nicdark_text_transform_uppercase nicdark_color_grey  nicdark_second_font nicdark_text_align_center nicdark_font_size_15 nicdark_letter_spacing_2"><?php the_search_query(); ?></h4>
			

    		<div class="nicdark_section nicdark_height_140"></div>

    	</div>

    </div>
    <!--end container-->

</div>
<!--end section-->


<div class="nicdark_section nicdark_height_50"></div>


<!--start section-->
<div class="nicdark_section">

    <!--start nicdark_container-->
    <div class="nicdark_container nicdark_clearfix">

    	
    	<!--start all posts previews-->
    	<?php if ( is_active_sidebar( 'nicdark_sidebar' ) ) { ?>  
    		<div class="nicdark_grid_8"> 
    	<?php }else{ ?>

    		<div class="nicdark_grid_12">
    	<?php } ?>
	

    		<?php if(have_posts()) : ?>
				
				<?php while(have_posts()) : the_post(); ?>
					
				
				<?php if ( is_active_sidebar( 'nicdark_sidebar' ) ) { }else{ ?> 
				<div class="nicdark_grid_4">
				<?php } ?>	

					<!--#post-->
					<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

						<div class="nicdark_section nicdark_box_shadow_0_0_15_0_000_01">

							<!--START PREVIEW-->
							<?php if (has_post_thumbnail()): ?>
								<div class="nicdark_section nicdark_image_archive">
									<?php the_post_thumbnail(); ?>
								</div>
							<?php endif ?>

							<div class="nicdark_section ">

								<div class="nicdark_section nicdark_float_left nicdark_padding_40_0 nicdark_padding_20_0_responsive nicdark_box_sizing_border_box">
									
									<h2 class="nicdark_font_weight_400 nicdark_font_size_35">
										<a class="nicdark_color_greydark nicdark_first_font nicdark_line_height_12_em nicdark_word_break_break_word" href="<?php the_permalink(); ?>">
											<?php the_title(); ?>
											<?php if ( has_post_format( 'video' )) { esc_html_e(' - Video','taroti'); } ?>
										</a>
									</h2>
									
									<div class="nicdark_section nicdark_height_15"></div>
									<p class="nicdark_color_grey nicdark_font_size_13 nicdark_second_font nicdark_letter_spacing_1"><?php the_time(get_option('date_format')) ?></p>
									<div class="nicdark_section nicdark_height_25"></div>

									<div class="nicdark_section nicdark_archive_excerpt"><?php the_excerpt(); ?></div>
									<div class="nicdark_section nicdark_height_20"></div>
									<a class="nicdark_bg_btn_archive nicdark_display_inline_block nicdark_font_size_16 nicdark_text_align_center nicdark_letter_spacing_1 nicdark_box_sizing_border_box nicdark_border_1_dashed_color nicdark_padding_15_30 nicdark_padding_top_13 nicdark_color_greydark nicdark_font_weight_400 nicdark_bg_orange " href="<?php the_permalink(); ?>"><?php esc_html_e('Read More','taroti'); ?></a>

								</div>
							</div>
							<!--END PREVIEW-->

						</div>

					</div>
					<!--#post-->


				<?php if ( is_active_sidebar( 'nicdark_sidebar' ) ) { }else{ ?> 
				</div>
				<?php } ?>	

				
					<?php if ( is_active_sidebar( 'nicdark_sidebar' ) ) { ?> 
					<div class="nicdark_section nicdark_height_50"></div>
					<?php } ?>	
					
				<?php endwhile; ?>
			<?php endif; ?>



			<!--START pagination-->
			<div class="nicdark_section">

				<?php

		    	the_posts_pagination( array(
					'prev_text'          => esc_html__( 'Prev', 'taroti' ),
					'next_text'          => esc_html__( 'Next', 'taroti' ),
					'before_page_number' => '<span class="meta-nav screen-reader-text">' . esc_html__( 'Page', 'taroti' ) . ' </span>',
				) );

				?>

				<div class="nicdark_section nicdark_height_50"></div>
			</div>
			<!--END pagination-->


    	</div>
    	<!--end all posts previews-->

 
    	
    	<!--sidebar-->
    	<?php if ( is_active_sidebar( 'nicdark_sidebar' ) ) { ?>  
    		
	    	<div class="nicdark_grid_4">
	    		<?php if ( ! get_sidebar( 'nicdark_sidebar' ) ) : ?><?php endif ?>
	    		<div class="nicdark_section nicdark_height_50"></div>
	    	</div>
	    	
    	<?php } ?>
    	<!--end sidebar-->

    	
	</div>
	<!--end container-->

</div>
<!--end section-->

<?php } ?>

<?php get_footer(); ?>