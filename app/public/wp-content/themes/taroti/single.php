<?php get_header(); ?>

<?php  if( get_option('nicdark_type_demo') == 1 ){ the_content(); }else{ ?>


<?php

if ( get_header_image() != '' ) {
    $nicdark_archive_header_image_class = 'nicdark_header_img_archive_exist';
}else{
    $nicdark_archive_header_image_class = '';
}

?>


<?php if ( get_the_title() != '' ) { ?>


    <!--start section-->
    <div style="background-image:url(<?php echo esc_url(get_header_image()); ?>)" id="nicdark_header_img_archive" class="nicdark_section nicdark_border_bottom_1_solid_grey <?php echo esc_attr($nicdark_archive_header_image_class); ?>">

        <!--start nicdark_container-->
        <div class="nicdark_container nicdark_clearfix">

            <div class="nicdark_grid_12">

                <div class="nicdark_section nicdark_height_140"></div>

                
                    <h1 id="nicdark_single_post_title" class="nicdark_font_size_112 nicdark_font_size_40_all_iphone nicdark_line_height_40_all_iphone nicdark_text_align_center nicdark_font_weight_600"><?php the_title(); ?></h1>
                    <div class="nicdark_section nicdark_height_30"></div>
                    <h4 id="nicdark_single_post_date" class="nicdark_text_transform_uppercase nicdark_color_grey  nicdark_second_font nicdark_text_align_center nicdark_font_size_15 nicdark_letter_spacing_2"><?php the_time(get_option('date_format')) ?></h4>
                

                <div class="nicdark_section nicdark_height_140"></div>

            </div>

        </div>
        <!--end container-->

    </div>
    <!--end section-->


<?php } ?>

<div class="nicdark_section nicdark_height_50"></div>

<!--start nicdark_container-->
<div class="nicdark_container nicdark_clearfix">


    <!--start all posts previews-->
    <?php if ( is_active_sidebar( 'nicdark_sidebar' ) ) { ?>  
        <div class="nicdark_grid_8"> 
    <?php }else{ ?>

        <div class="nicdark_grid_12">
    <?php } ?>



    <?php if(have_posts()) :
        while(have_posts()) : the_post(); ?>
            
            <!--#post-->
            <div class="nicdark_section nicdark_container_single_php" id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

                
                <?php if ( has_post_thumbnail() ) { the_post_thumbnail(); }  ?>

                <!--start content-->
                <?php the_content(); ?>
                <!--end content-->

            </div>
            <!--#post-->


            <div class="nicdark_section">

                 
                <?php $args = array(
                    'before'           => '<!--link pagination--><div id="nicdark_link_pages" class="nicdark_section"><p class="nicdark_margin_0 nicdark_first_font nicdark_color_greydark  nicdark_display_inline nicdark_padding_0 nicdark_border_radius_15">',
                    'after'            => '</p></div><!--end link pagination-->',
                    'link_before'      => '',
                    'link_after'       => '',
                    'next_or_number'   => 'number',
                    'nextpagelink'     => esc_html__('Next page', 'taroti'),
                    'previouspagelink' => esc_html__('Previous page', 'taroti'),
                    'pagelink'         => '%',
                    'echo'             => 1
                ); ?>
                <?php wp_link_pages( $args ); ?>

            
                <?php if(has_tag()) { ?>  
                    <!--tag-->
                    <div id="nicdark_tags_list" class="nicdark_section nicdark_border_top_1_solid_grey nicdark_padding_top_20">
                        
                        <img alt="<?php esc_attr_e('Single Post Tag','taroti'); ?>" width="20" class="nicdark_float_left nicdark_margin_right_20 nicdark_margin_top_4" src="<?php echo esc_url(get_template_directory_uri()); ?>/img/icon-tag.png">
                        <?php the_tags(''); ?>

                    </div>
                    <!--END tag-->
                <?php } ?>


                <!--categories-->
                <div id="nicdark_categories_list" class="nicdark_section nicdark_border_bottom_1_solid_grey nicdark_padding_bottom_20">
                    
                    <img alt="<?php esc_attr_e('Single Post Category','taroti'); ?>" width="20" class="nicdark_float_left nicdark_margin_right_20 nicdark_margin_top_3" src="<?php echo esc_url(get_template_directory_uri()); ?>/img/icon-folder.png">
                    <?php the_category(', '); ?>
                   
                </div>
                <!--END categories-->

                

                <?php 

                if ( comments_open() || get_comments_number() ) {
                    comments_template();
                }
                     
                ?>
                

            </div>

        
        <?php endwhile; ?>
    <?php endif; ?>


    </div>


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


<div class="nicdark_section nicdark_height_60"></div>  

<?php } ?>    

<?php get_footer(); ?>