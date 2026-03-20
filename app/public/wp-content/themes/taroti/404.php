<?php get_header(); ?>

<?php if( get_option('nicdark_type_demo') == 1 ){ the_content(); }else{ ?>


<section class="nicdark_section nicdark_height_90_vh nicdark_display_table">
    <div class="nicdark_container nicdark_clearfix nicdark_display_table_cell nicdark_vertical_align_middle">
        
        <div class="nicdark_grid_6 nicdark_text_align_right">

        	<h1 class="nicdark_font_size_150"><strong>404</strong></h1>
                 
        </div>

        <div class="nicdark_grid_6 nicdark_text_align_left">

            <p class="nicdark_font_size_13 nicdark_padding_left_20 nicdark_margin_top_40 nicdark_letter_spacing_1 nicdark_border_left_2_solid_22b6af"><?php esc_html_e("We can't found the page","taroti"); ?></p>
            <div class="nicdark_section nicdark_height_10"></div>
            <h1><strong><?php esc_html_e("Page Not Found","taroti"); ?></strong></h1>
       
        </div>

        <div class="nicdark_grid_12 nicdark_text_align_center nicdark_404_search_section">

        	<p><?php esc_html_e("You can search on the bar below or return to","taroti"); ?> <a href="<?php echo esc_url(home_url()); ?>"><?php esc_html_e("homepage !","taroti"); ?></a></p>
            <div class="nicdark_section nicdark_height_20"></div>
            <?php get_search_form(); ?>
                 
        </div>

    </div>
</section>



<?php } ?>

<?php get_footer(); ?>
