<?php

$nicdark_themename = "taroti";

//TGMPA required plugin
require_once get_template_directory() . '/class-tgm-plugin-activation.php';
add_action( 'tgmpa_register', 'nicdark_register_required_plugins' );
function nicdark_register_required_plugins() {

    $nicdark_plugins = array(

        //wp import
        array(
            'name'      => esc_html__( 'Wordpress Importer', 'taroti' ),
            'slug'      => 'wordpress-importer',
            'required'  => true,
        ),


        //nd shortcodes
        array(
            'name'      => esc_html__( 'ND Shortcodes', 'taroti' ),
            'slug'      => 'nd-shortcodes',
            'required'  => true,
        ),


        //nd elements
        array(
            'name'      => esc_html__( 'ND Elements', 'taroti' ),
            'slug'      => 'nd-elements',
            'required'  => true,
        ),


        //elementor
        array(
            'name'      => esc_html__( 'Elementor', 'taroti' ),
            'slug'      => 'elementor',
            'required'  => true,
        ),


        //contact-form-7
        array(
            'name'      => esc_html__( 'Contact Form 7', 'taroti' ),
            'slug'      => 'contact-form-7',
            'required'  => true,
        ),


        //woocommerce
        array(
            'name'      => esc_html__( 'WooCommerce', 'taroti' ),
            'slug'      => 'woocommerce',
            'required'  => true,
        ),
        

    );


    $nicdark_config = array(
        'id'           => 'taroti',                 // Unique ID for hashing notices for multiple instances of TGMPA.
        'default_path' => '',                      // Default absolute path to bundled plugins.
        'menu'         => 'tgmpa-install-plugins', // Menu slug.
        'has_notices'  => true,                    // Show admin notices or not.
        'dismissable'  => true,                    // If false, a user cannot dismiss the nag message.
        'dismiss_msg'  => '',                      // If 'dismissable' is false, this message will be output at top of nag.
        'is_automatic' => false,                   // Automatically activate plugins after installation or not.
        'message'      => '',                      // Message to output right before the plugins table. 
    );

    tgmpa( $nicdark_plugins, $nicdark_config );
}
//END tgmpa


//translation
load_theme_textdomain( 'taroti', get_template_directory().'/languages' );


//register my menus
function nicdark_register_my_menus() {
  register_nav_menu( 'main-menu', esc_html__( 'Main Menu', 'taroti' ) );  
}
add_action( 'init', 'nicdark_register_my_menus' );


//Content_width
if (!isset($content_width )) $content_width  = 1330;


//automatic-feed-links
add_theme_support( 'automatic-feed-links' );

//post-thumbnails
add_theme_support( "post-thumbnails" );

//post-formats
add_theme_support( 'post-formats', array( 'quote', 'image', 'link', 'video', 'gallery', 'audio' ) );

//title tag
add_theme_support( 'title-tag' );

//align-wide
add_theme_support( 'align-wide' );

//wp-block-styles
add_theme_support( 'wp-block-styles' );

//responsive-embeds
add_theme_support( 'responsive-embeds' );

//custom-background
add_theme_support( 'custom-background' );

add_theme_support( 'html5', array( 'comment-list', 'comment-form', 'search-form', 'gallery', 'caption' ) );

add_theme_support( 'custom-logo' );

add_theme_support( 'custom-header' );

// Sidebar
function nicdark_add_sidebars() {

    // Sidebar Main
    register_sidebar(array(
        'name' =>  esc_html__('Sidebar','taroti'),
        'id' => 'nicdark_sidebar',
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h3>',
        'after_title' => '</h3>',
    ));

}
add_action( 'widgets_init', 'nicdark_add_sidebars' );

//add css and js
function nicdark_enqueue_scripts()
{
	
    //css
    wp_enqueue_style( 'nicdark-style', get_stylesheet_uri() );
    wp_enqueue_style( 'nicdark-fonts', nicdark_google_fonts_url(), array(), '1.0.0' );

    //comment-reply
    if ( is_singular() ) wp_enqueue_script( 'comment-reply' );

    //navigation
    wp_enqueue_script('nicdark-navigation', get_template_directory_uri() . '/js/nicdark-navigation.js', array('jquery'), false, true );

}
add_action("wp_enqueue_scripts", "nicdark_enqueue_scripts");
//end js


function nicdark_admin_enqueue_scripts() {
  
  wp_enqueue_style( 'nicdark-admin-style', get_template_directory_uri() . '/admin-style.css', array(), false, false );
  
}
add_action( 'admin_enqueue_scripts', 'nicdark_admin_enqueue_scripts' );


//woocommerce support
add_theme_support( 'woocommerce' );

//editor style
add_editor_style( 'css/custom-editor-style.css' );

//add style to quote
if ( function_exists( 'register_block_style' ) ) {
    register_block_style(
        'core/quote',
        array(
            'name'         => 'blue-quote',
            'label'        => __( 'Blue Quote', 'taroti' ),
            'is_default'   => true,
            'inline_style' => '.wp-block-quote.is-style-blue-quote { color: blue; }',
        )
    );
}

//add block pattern
function nicdark_register_block_patterns() {
        register_block_pattern(
            'wpdocs/nd-pattern',
            array(
                'title'         => __( 'ND Pattern', 'taroti' ),
                'description'   => _x( 'Awesome ND Pattern', 'Use this nicdark pattern', 'taroti' ),
                'content'       => '<!-- wp:paragraph --><p>Nicdark Pattern</p><!-- /wp:paragraph -->',
                'categories'    => array( 'text' ),
                'keywords'      => array( 'nicdark' ),
                'viewportWidth' => 800,
            )
        );
}
add_action( 'init', 'nicdark_register_block_patterns' );



//define nicdark theme option
function nicdark_theme_setup(){
    add_option( 'nicdark_theme_author', 1, '', 'yes' );
    update_option( 'nicdark_theme_author', 1 );
}
add_action( 'after_setup_theme', 'nicdark_theme_setup' );


//START add google fonts
function nicdark_google_fonts_url() {
    
    $nicdark_font_url = '';
    
    if ( 'off' !== _x( 'on', 'Google font: on or off', 'taroti' ) ) {
        $nicdark_font_url = add_query_arg( 'family', urlencode( 'Ibarra Real Nova:300,400,500,600,700|Jost:300,400,500,600,700' ), "//fonts.googleapis.com/css" );
    }

    return $nicdark_font_url;

}
//END add google fonts



//START create elementor widget
function nicdark_elementor_taroti_post_grid_widget( $widgets_manager ) {

    require_once( __DIR__ . '/widgets/post-grid.php' );
    $widgets_manager->register( new \Taroti_Post_Grid_Widget() );

}
add_action( 'elementor/widgets/register', 'nicdark_elementor_taroti_post_grid_widget' );

function nicdark_register_elementor_theme_locations( $elementor_theme_manager ) {
    $elementor_theme_manager->register_all_core_location();
}
add_action( 'elementor/theme/register_locations', 'nicdark_register_elementor_theme_locations' );


// Simplify WooCommerce checkout fields.
function nicdark_simplify_checkout_fields( $fields ) {

    if ( ! is_array( $fields ) ) {
        return $fields;
    }

    $base_location = wc_get_base_location();
    $default_country = ! empty( $base_location['country'] ) ? $base_location['country'] : WC()->countries->get_base_country();
    $default_state = ! empty( $base_location['state'] ) ? $base_location['state'] : '';

    $fields['billing'] = array(
        'billing_full_name' => array(
            'label'       => esc_html__( 'Full name', 'taroti' ),
            'placeholder' => esc_html__( 'Enter your full name', 'taroti' ),
            'required'    => true,
            'class'       => array( 'form-row-wide' ),
            'priority'    => 10,
            'clear'       => true,
        ),
        'billing_phone' => array(
            'label'       => esc_html__( 'Phone', 'taroti' ),
            'placeholder' => esc_html__( 'Enter your phone number', 'taroti' ),
            'required'    => true,
            'class'       => array( 'form-row-wide' ),
            'priority'    => 20,
            'clear'       => true,
        ),
        'billing_email' => array(
            'label'       => esc_html__( 'Email', 'taroti' ),
            'placeholder' => esc_html__( 'Enter your email', 'taroti' ),
            'required'    => true,
            'class'       => array( 'form-row-wide' ),
            'priority'    => 30,
            'clear'       => true,
        ),
        'billing_address_1' => array(
            'label'       => esc_html__( 'Street address', 'taroti' ),
            'placeholder' => esc_html__( 'House number and street name', 'taroti' ),
            'required'    => true,
            'class'       => array( 'form-row-wide' ),
            'priority'    => 40,
            'clear'       => true,
        ),
        'billing_note' => array(
            'type'        => 'textarea',
            'label'       => esc_html__( 'Note', 'taroti' ),
            'placeholder' => esc_html__( 'Additional delivery notes (optional)', 'taroti' ),
            'required'    => false,
            'class'       => array( 'form-row-wide' ),
            'priority'    => 45,
            'clear'       => true,
        ),
        'billing_country' => array(
            'type'     => 'hidden',
            'default'  => $default_country,
            'required' => true,
            'priority' => 50,
        ),
        'billing_state' => array(
            'type'     => 'hidden',
            'default'  => $default_state,
            'required' => false,
            'priority' => 60,
        ),
    );

    $fields['shipping'] = array();

    if ( isset( $fields['order'] ) ) {
        unset( $fields['order']['order_comments'] );
    }

    return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'nicdark_simplify_checkout_fields', 999 );

function nicdark_hide_shipping_checkout_fields( $needs_shipping_address ) {
    return false;
}
add_filter( 'woocommerce_cart_needs_shipping_address', 'nicdark_hide_shipping_checkout_fields' );

function nicdark_disable_order_notes_field( $enabled ) {
    return false;
}
add_filter( 'woocommerce_enable_order_notes_field', 'nicdark_disable_order_notes_field' );

function nicdark_split_full_name( $full_name ) {
    $full_name = trim( preg_replace( '/\s+/', ' ', (string) $full_name ) );

    if ( '' === $full_name ) {
        return array(
            'first_name' => '',
            'last_name'  => '',
        );
    }

    $parts = explode( ' ', $full_name );

    if ( 1 === count( $parts ) ) {
        return array(
            'first_name' => $parts[0],
            'last_name'  => '',
        );
    }

    $last_name = array_pop( $parts );

    return array(
        'first_name' => implode( ' ', $parts ),
        'last_name'  => $last_name,
    );
}

function nicdark_normalize_checkout_posted_data( $data ) {

    if ( empty( $data['billing_full_name'] ) ) {
        return $data;
    }

    $name_parts = nicdark_split_full_name( wp_unslash( $data['billing_full_name'] ) );
    $base_location = wc_get_base_location();
    $default_country = ! empty( $base_location['country'] ) ? $base_location['country'] : WC()->countries->get_base_country();
    $default_state = ! empty( $base_location['state'] ) ? $base_location['state'] : '';

    $data['billing_first_name'] = $name_parts['first_name'];
    $data['billing_last_name']  = $name_parts['last_name'];
    $data['billing_country']    = ! empty( $data['billing_country'] ) ? $data['billing_country'] : $default_country;
    $data['billing_state']      = ! empty( $data['billing_state'] ) ? $data['billing_state'] : $default_state;
    $data['billing_address_2']  = '';
    $data['billing_city']       = '';
    $data['billing_postcode']   = '';
    $data['billing_company']    = '';

    $data['ship_to_different_address'] = 0;
    $data['shipping_first_name'] = $name_parts['first_name'];
    $data['shipping_last_name']  = $name_parts['last_name'];
    $data['shipping_company']    = '';
    $data['shipping_country']    = $data['billing_country'];
    $data['shipping_state']      = $data['billing_state'];
    $data['shipping_city']       = '';
    $data['shipping_postcode']   = '';
    $data['shipping_address_1']  = isset( $data['billing_address_1'] ) ? $data['billing_address_1'] : '';
    $data['shipping_address_2']  = '';

    return $data;
}
add_filter( 'woocommerce_checkout_posted_data', 'nicdark_normalize_checkout_posted_data', 20 );

function nicdark_prefill_checkout_full_name( $value, $input ) {

    if ( 'billing_full_name' !== $input ) {
        return $value;
    }

    $customer = WC()->customer;

    if ( ! $customer ) {
        return $value;
    }

    $full_name = trim( $customer->get_billing_first_name() . ' ' . $customer->get_billing_last_name() );

    return '' !== $full_name ? $full_name : $value;
}
add_filter( 'woocommerce_checkout_get_value', 'nicdark_prefill_checkout_full_name', 10, 2 );

function nicdark_validate_full_name_checkout_field() {

    if ( ! isset( $_POST['billing_full_name'] ) ) {
        wc_add_notice( esc_html__( 'Full name is a required field.', 'taroti' ), 'error' );
        return;
    }

    $full_name = trim( sanitize_text_field( wp_unslash( $_POST['billing_full_name'] ) ) );

    if ( '' === $full_name ) {
        wc_add_notice( esc_html__( 'Full name is a required field.', 'taroti' ), 'error' );
    }
}
add_action( 'woocommerce_after_checkout_validation', 'nicdark_validate_full_name_checkout_field', 10, 0 );

function nicdark_save_full_name_on_order( $order, $data ) {

    if ( empty( $data['billing_full_name'] ) ) {
        $full_name = '';
    } else {
        $full_name = sanitize_text_field( $data['billing_full_name'] );
        $order->update_meta_data( '_billing_full_name', $full_name );
    }

    if ( empty( $data['billing_note'] ) ) {
        return;
    }

    $order->set_customer_note( sanitize_textarea_field( $data['billing_note'] ) );
}
add_action( 'woocommerce_checkout_create_order', 'nicdark_save_full_name_on_order', 20, 2 );



//START Add heaer customizer
add_action('customize_register','nicdark_customizer_header');
function nicdark_customizer_header( $wp_customize ) {
  

    //ADD panel
    $wp_customize->add_panel( 'nicdark_customizer_header_panel', array(
      'title' => __( 'Header Taroti','taroti' ),
      'capability' => 'edit_theme_options',
      'theme_supports' => '',
      'description' => __( 'Header Settings','taroti' ), //  html tags such as <p>.
      'priority' => 130, // Mixed with top-level-section hierarchy.
    ) );


    //ADD section
    $wp_customize->add_section( 'nicdark_customizer_header_section' , array(
      'title' => __( 'Button','taroti' ),
      'priority'    => 50,
      'panel' => 'nicdark_customizer_header_panel',
    ) );


    //Option 1
    $wp_customize->add_setting( 'nicdark_text_header_button', array(
      'type' => 'option', // or 'option'
      'capability' => 'edit_theme_options',
      'theme_supports' => '', // Rarely needed.
      'default' => '',
      'transport' => 'refresh', // or postMessage
      'sanitize_callback' => 'sanitize_text_field',
    ) );

    $wp_customize->add_control( 'nicdark_text_header_button', array(
      'label' => __( 'Button Text','taroti' ),
      'description' => __('Insert the Text for your header Button','taroti'),
      'type' => 'text',
      'section' => 'nicdark_customizer_header_section',
    ) );


    //Option 2
    $wp_customize->add_setting( 'nicdark_link_header_button', array(
      'type' => 'option', // or 'option'
      'capability' => 'edit_theme_options',
      'theme_supports' => '', // Rarely needed.
      'default' => '',
      'transport' => 'refresh', // or postMessage
      'sanitize_callback' => 'sanitize_url',
    ) );

    $wp_customize->add_control( 'nicdark_link_header_button', array(
      'label' => __( 'Button Url','taroti' ),
      'description' => __('Insert the Url for your header Button','taroti'),
      'type' => 'url',
      'section' => 'nicdark_customizer_header_section',
    ) );




}








//START create welcome page on activation

//create transient
add_action( 'after_switch_theme','nicdark_welcome_set_trans');
function nicdark_welcome_set_trans(){ if ( ! is_network_admin() ) { set_transient( 'nicdark_welcome_page_redirect', 1, 30 ); } }

//create page
add_action('admin_menu', 'nicdark_create_welcome_page');
function nicdark_create_welcome_page() {
    add_menu_page(esc_html__( 'Taroti Theme', 'taroti' ), esc_html__( 'Taroti Theme', 'taroti' ), 'manage_options', 'nicdark-welcome-theme-page', 'nicdark_welcome_page_content', 'dashicons-admin-settings' );
}

//set redirect
add_action( 'admin_init', 'nicdark_welcome_theme_page_redirect' );
function nicdark_welcome_theme_page_redirect() {

    if ( ! get_transient( 'nicdark_welcome_page_redirect' ) ) { return; }
    delete_transient( 'nicdark_welcome_page_redirect' );
    if ( is_network_admin() ) { return; }
    wp_safe_redirect( add_query_arg( array( 'page' => 'nicdark-welcome-theme-page' ), esc_url( admin_url( 'admin.php' ) ) ) );
    exit;

}

//page content
function nicdark_welcome_page_content(){
    
    $nicdark_theme = wp_get_theme();

    //theme plugins required
    $nicdark_plugins_required = array('nd-shortcodes','nd-elements','wordpress-importer','elementor','contact-form-7','woocommerce');


    //start check if all plugins are activated
    $nicdark_all_plugins_required = 0;
    foreach( $nicdark_plugins_required as $nicdark_plugin_required ){


        if ($nicdark_plugin_required == 'nd-shortcodes') { $nicdark_plugin_required_function = 'nd_options_load_textdomain'; }
        if ($nicdark_plugin_required == 'nd-elements') { $nicdark_plugin_required_function = 'nd_elements_scripts'; }
        if ($nicdark_plugin_required == 'wordpress-importer') { $nicdark_plugin_required_function = 'wordpress_importer_init'; }
        if ($nicdark_plugin_required == 'elementor') { $nicdark_plugin_required_function = 'elementor_fail_wp_version'; }
        if ($nicdark_plugin_required == 'contact-form-7') { $nicdark_plugin_required_function = 'wpcf7_init'; }
        if ($nicdark_plugin_required == 'woocommerce') { $nicdark_plugin_required_function = 'wc_get_container'; }

        if ( function_exists($nicdark_plugin_required_function) ) {
            $nicdark_all_plugins_required = 1;
        }else{
            $nicdark_all_plugins_required = 0;
            break; 
        }

    }
    //end check if all plugins are activated


    ?>

    <style>
        #setting-error-tgmpa { display:none !important; }
    </style>

    <div class="nicdark_section nicdark_padding_right_20 nicdark_padding_left_2 nicdark_margin_top_25">

        

        <!--start THEME TITLE-->
        <div class="nicdark_section nicdark_background_color_1d2327 nicdark_padding_20 nicdark_border_bottom_3_solid_2271b1">
            <h2 class="nicdark_display_inline_block nicdark_color_ffffff">
                <?php esc_html_e('Taroti','taroti'); ?>   
            </h2>
            <span class="nicdark_color_a0a5aa nicdark_margin_left_10">
                <?php esc_html_e('1.1','taroti'); ?>
            </span>
        </div>
        <!--end THEME TITLE-->

    


        <div class="nicdark_section nicdark_box_shadow_0_1_1_000_4 nicdark_background_color_ffffff nicdark_border_1_solid_e5e5e5 nicdark_border_1_solid_e5e5e5 nicdark_border_top_width_0 nicdark_border_left_width_0 nicdark_overflow_hidden nicdark_position_relative">
    
          


          <!--START menu-->
          <div class="nicdark_position_absolute nicdark_box_sizing_border_box nicdark_float_left nicdark_background_color_2c3338 nicdark_width_20_percentage nicdark_min_height_3000">

            <ul class="nicdark_demo_navigation nicdark_padding_0 nicdark_margin_0 nicdark_list_style_none">
              
                <li class="nicdark_padding_0 nicdark_margin_0">
                    <p class="nicdark_import_demo_nav nicdark_background_color_2271b1 nicdark_font_size_14px nicdark_text_decoration_none nicdark_color_ffffff nicdark_padding_8_20 nicdark_display_block nicdark_margin_0">
                        <?php esc_html_e('1 - Install Required Plugins','taroti'); ?>        
                    </p>
                </li>
                
                <li class="nicdark_padding_0 nicdark_margin_0">
                    <p class="nicdark_import_demo_nav nicdark_font_size_14px nicdark_text_decoration_none nicdark_color_ffffff nicdark_padding_8_20 nicdark_display_block nicdark_margin_0">
                        <?php esc_html_e('2 - Choose the Demo','taroti'); ?>        
                    </p>
                </li>

                <li class="nicdark_padding_0 nicdark_margin_0">
                    <p class="nicdark_import_demo_nav nicdark_font_size_14px nicdark_text_decoration_none nicdark_color_ffffff nicdark_padding_8_20 nicdark_display_block nicdark_margin_0">
                        <?php esc_html_e('3 - Import Content and Style','taroti'); ?>
                    </p>
                </li>

                <li class="nicdark_padding_0 nicdark_margin_0">
                    <p class="nicdark_import_demo_nav nicdark_font_size_14px nicdark_text_decoration_none nicdark_color_ffffff nicdark_padding_8_20 nicdark_display_block nicdark_margin_0">
                        <?php esc_html_e('4 - Enjoy your Theme','taroti'); ?>
                    </p>
                </li>


                <?php 

                if ( $nicdark_all_plugins_required == 1 ) {
                    if ( function_exists('nicdark_import_demo_nav') ){ do_action("nicdark_import_demo_nav_nd"); } 
                }

                ?>

                
            </ul>

          </div>
          <!--END menu-->





      <!--START content-->
      <div class="nicdark_padding_20 nicdark_box_sizing_border_box nicdark_margin_left_20_percentage nicdark_float_left nicdark_width_80_percentage">


        <!--START-->
        <div class="nicdark_section">
          
            

            <!--START 1-->
            <div class="nicdark_import_demo_1_step nicdark_padding_20 nicdark_box_sizing_border_box nicdark_width_100_percentage">


                <div class="nicdark_section">
                    <div class="nicdark_width_40_percentage nicdark_padding_20 nicdark_box_sizing_border_box nicdark_float_left">
                        <h1 class="nicdark_section nicdark_margin_0">
                            <?php esc_html_e('Taroti Theme','taroti'); ?>
                        </h1>
                        <p class="nicdark_color_666666 nicdark_section nicdark_margin_0 nicdark_margin_top_20">
                            <?php esc_html_e('Thanks for choosing our theme. If you want check also our site','taroti'); ?>
                            <a target="_blank" href="https://www.nicdark.com"><?php esc_html_e('Nicdark.com','taroti'); ?></a>
                        </p>
                    </div>
                </div>

                
                <div class="nicdark_section nicdark_height_1 nicdark_background_color_E7E7E7 nicdark_margin_top_10 nicdark_margin_bottom_10"></div>

                
                <div class="nicdark_section">
                    
                    <div class="nicdark_width_50_percentage nicdark_padding_20 nicdark_box_sizing_border_box nicdark_float_left">
                        <h2 class="nicdark_section nicdark_margin_0">
                            <?php esc_html_e('How do I import the sample demo ?','taroti'); ?>
                        </h2>
                        <p class="nicdark_color_666666 nicdark_section nicdark_margin_0 nicdark_margin_top_10">
                            <?php esc_html_e('Start by installing and activating the plugins required by the theme','taroti'); ?>
                        </p>
                        <a class="button button-primary nicdark_margin_top_15_important" target="_blank" href="<?php echo esc_url(admin_url('themes.php?page=tgmpa-install-plugins')); ?>">
                            <?php esc_html_e('Go to plugins page','taroti'); ?>
                        </a>


                        <!--plugins notice-->
                        <div class="nicdark_box_sizing_border_box nicdark_float_left nicdark_width_100_percentage">
                          <div class="notice notice-error nicdark_padding_20 nicdark_margin_top_30 nicdark_margin_0">
                            <p><?php esc_html_e('If all the plugins are not installed and active it will not be possible to reach the second step, if you having trouble installing plugins check out our article below','taroti'); ?></p>
                            <a target="blank" href="https://documentation.nicdark.com/plugin-installation-problems/"><?php esc_html_e('Check the article','taroti'); ?></p></a>
                          </div>
                        </div>
                        <!--plugins notice-->


                    </div>


                    <div class="nicdark_width_50_percentage nicdark_padding_20 nicdark_text_align_center nicdark_box_sizing_border_box nicdark_float_left">
                        <img id="nicdark_theme_image" src="<?php  echo esc_url(get_template_directory_uri()); ?>/screenshot.jpg">
                        <a target="_blank" class="button" href="https://www.nicdark.com/wordpress-themes/"><?php esc_html_e('All Nicdark WordPress Themes','taroti'); ?></a>
                    </div>


                </div>

                
                <div class="nicdark_section nicdark_height_1 nicdark_background_color_E7E7E7 nicdark_margin_top_10 nicdark_margin_bottom_10"></div>


                <div class="nicdark_section">
                    <div class="nicdark_width_50_percentage nicdark_padding_20 nicdark_box_sizing_border_box nicdark_float_left">
                        <p class="nicdark_color_666666 nicdark_section nicdark_margin_0 nicdark_margin_top_10">
                            <?php esc_html_e('Once all plugins are installed and activated, return and refresh this page for go the second step.','taroti'); ?>
                        </p>
                    </div>
                </div>


          </div>
          <!--END 1-->


          <?php 


          if ( $nicdark_all_plugins_required == 1 ) {
            if ( function_exists('nicdark_import_demo') ){ do_action("nicdark_import_demo_nd"); } 
          }

          ?>


        </div>
        <!--END-->

      
      </div>
      <!--END content-->


    </div>

  </div>





<?php


}
//END create welcome page on activation
