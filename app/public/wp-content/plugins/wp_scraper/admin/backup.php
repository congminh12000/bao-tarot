<?php  if ( ! defined( 'ABSPATH' ) ) exit;  

    class Extendons_Wp_Scrapper_admin extends Extendons_wp_scrapper {


        public function __construct() {
            
            add_action('admin_menu', array($this,'my_menu_pages'));
            add_action( 'wp_ajax_scrape_data', array($this,'scrape_site_data' ));
            add_action( 'wp_ajax_nopriv_scrape_data', array($this,'scrape_site_data' ));
            add_action( 'wp_ajax_scrape_custom_data', array($this,'scrape_custom_site_data' ));
            add_action( 'wp_ajax_nopriv_scrape_custom_data', array($this,'scrape_custom_site_data' ));
            add_action( 'wp_ajax_post_data', array($this,'post_site_data' ));
            add_action( 'wp_ajax_nopriv_post_data', array($this,'post_site_data' ));
            add_action( 'init',array( $this, 'front_init' ),20);
        }
       
 
        public function front_init() {
            if ( isset ($_GET['page']) && isset ($_GET['wp_scraper'])) {
                wp_enqueue_media();
                 }
            wp_enqueue_script('jquery');
            wp_enqueue_style('bootstrap_css2',EXT_FSP_URL.'admin/style/bootstrap-iso.css');
            wp_enqueue_style( 'bootstrap_style', EXT_FSP_URL.'admin/style/bootstrap-iso.css', false );
            wp_enqueue_style( 'awesome-bootstrap-checkbox-css', EXT_FSP_URL.'admin/style/awesome-bootstrap-checkbox.css', false );
            wp_enqueue_style( 'font-awesome-min', '//cdnjs.cloudflare.com/ajax/libs/font-awesome/3.2.1/css/font-awesome.min.css', false );

            require_once(EXT_FSP_PLUGIN_DIR.'admin/lib/simple_html_dom.php');
        }
       

        public function my_menu_pages(){
            add_menu_page('Extendons WP Scrapper', 'Extendons WP Scrapper', 'manage_options', 'wp_scraper', ARRAY($this,'wp_scrapper_setting' ),plugins_url( 'admin/style/ext_icon.png', dirname( __FILE__ ) ));
            add_submenu_page('wp_scraper', 'Extendons Custom Site Scraper', 'Extendons Custom Site Scraper', 'manage_options',"custom_scrapper",ARRAY($this,'custom_scrapper_setting' ));
            // add_submenu_page('my-menu', 'Submenu Page Title2', 'Whatever You Want2', 'manage_options', 'my-menu2' );
        }

        public function scrape_custom_site_data(){
            global $wpdb;

            if(isset($_POST['link']) && isset($_POST['dtype']) ) {

                $link = $_POST['link'];
                $dtype= $_POST['dtype'];
                $c_id = $_POST['c_id'];
                $title= $_POST['title'];
                $price = $_POST['price'];
                $desp= $_POST['desp'];
                $image = $_POST['image'];
                switch($dtype){
                    
                    case 'product':
                        $this->scrape_custom_product($link,$c_id,$title,$price,$desp,$image);
                    break;

                    default:
                    echo 'Please Select the scrape type';

                }
            }
            die();
        }

        public function scrape_custom_product($link,$c_id,$title,$price,$desp,$image){
            $context = stream_context_create(
                array(
                    "http" => array(
                        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                    )
                )
            );
            $dom = file_get_html($link, 'false', $context);
            $answer = array();
            if(!empty($dom)) {
                foreach($dom->find(".type-product") as $divClass) {
                    foreach($divClass->find('form[class=variations_form]') as $variation ){
                         $answer['variation'] = $variation->getAttribute('data-product_variations');
                        break;

                    }
                }
               
                foreach($dom->find($c_id) as $divClass) {
                    //title
                    foreach($divClass->find($title) as $title ) {
                        $answer['title'] = $title->plaintext;
                        break;
                    }
                    //price
                    foreach($divClass->find($price) as $price ) {
                        $answer['price'] = trim($price->plaintext);
                        break;
                    }
                    // //content
                    foreach($divClass->find($desp) as $content ) {
                        $answer['content'] = trim($content->plaintext);
                        break;
                    }
                    //main image 
                    foreach($divClass->find($image) as $imagee ) {
                        $answer['image'] = trim($imagee->src);
                        break;
                    }
                    //extra image 
                    if(sizeof($divClass->find('div[class=woocommerce-product-gallery__image]') > 1))
                        {
                        $size=sizeof($divClass->find('div[class=woocommerce-product-gallery__image]'));
                        for($imgnum=1;$imgnum<$size;$imgnum++ ){
                            $answer['extimage'][$imgnum] = $divClass->find('div[class=woocommerce-product-gallery__image]\a\img')[$imgnum]->src; 
                        }
                    }                      
                    // }
                    //variations_form
                    // foreach($divClass->find('form[class=variations_form]') as $variation ) {
                    //     $answer['variation'] = $variation->getAttribute('data-product_variations');
                    //     //str_replace('&quot;', '"',
                    // } 

                    // $i++;
                }
            }
            $Result=array($answer,'product');
            echo json_encode($Result);
            
        }
        public function scrape_custom_shop($link,$c_id,$title,$price,$desp,$image){
            $context = stream_context_create(
                array(
                    "http" => array(
                        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                    )
                )
            );

            $dom = file_get_html($link, 'false', $context);
            $answer = array();
            if(!empty($dom)) {
            $divClass = $title ='';$i = 0;

                foreach($dom->find($c_id) as $divClass) {
                //for shop page
                    $size=sizeof($divClass->find('a[class=woocommerce-loop-product__link]'));
                    for($pno=0;$pno<$size;$pno++ ){
                        $answer['products'][$pno] = $divClass->find('a[class=woocommerce-loop-product__link]')[$pno]->getAttribute('href'); 
                    } 
                    $products = array();
                    for($loop=0;$loop<$size;$loop++){
                        // title
                        $context = stream_context_create(
                            array(
                                "http" => array(
                                    "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                                )
                            )
                        );
                        $dom = file_get_html($answer['products'][$loop], 'false', $context);
                        if(!empty($dom)) {
                            $divClass = $title ='';$i = 0;


                            foreach($dom->find($c_id) as $divClass) {

                                foreach($divClass->find($title) as $title ) {
                                    $products[$loop]['title'] = $title->plaintext;
                                    break;
                                }
                                //price
                                foreach($divClass->find($price) as $price ) {
                                    $products[$loop]['price'] = trim($price->plaintext);
                                    break;
                                }
                                //content
                                // foreach($divClass->find($desp) as $content ) {
                                //     $products[$loop]['content'] = trim($content->plaintext);
                                //     break;
                                // }
                                //main image 
                                foreach($divClass->find('img[class='.$image.']') as $image ) {
                                    $products[$loop]['image'] = trim($image->src);
                                break;
                                }
                                //extra image 
                                // if(sizeof($divClass->find('div[class=woocommerce-product-gallery__image]')) > 1){
                                //     $sizeimg=sizeof($divClass->find('div[class=woocommerce-product-gallery__image]'));
                                //     for($imgnum=1;$imgnum<$sizeimg;$imgnum++ ){
                                //         $products[$loop]['extimage'][$imgnum] = $divClass->find('div[class=woocommerce-product-gallery__image]\a\img')[$imgnum]->src;
                                //     }
                                // }
                                // variations_form
                                // foreach($divClass->find('form[class=variations_form]') as $variation ) {
                                //     $products[$loop]['variation'] = trim($variation->getAttribute('data-product_variations'));
                                // } 
                            }
                        }    
                    }
                }
            }
            $Result=array($products,'shop');
            echo json_encode($Result);
        }

        public function scrape_site_data(){
            global $wpdb;

            if(isset($_POST['link']) && isset($_POST['dtype']) ) {

                $link = $_POST['link'];
                $dtype= $_POST['dtype'];
                switch($dtype){
                    case 'post':
                        $this->scrape_post($link);
                    break;

                    case 'product':
                        $this->scrape_product($link);
                    break;

                    case 'shop':
                        $this->scrape_shop($link);
                    break;

                    default:
                    echo 'Please Select the scrape type';

                }
            }
            die();
        }

       public function scrape_shop($link) {
                  $products = array();
                  $context = stream_context_create(
                      array(
                          "http" => array(
                              "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                          )
                      )
                  );

                  $dom = file_get_html($link, 'false', $context);
                  // print_r($dom);
                  $answer = array();

                  if (!empty($dom)) {

                      $divClass = $title ='';$i = 0;
                      foreach($dom->find(".products") as $divClass) {

                      //for shop page [class=woocommerce-loop-product__link]
                          $size=sizeof($divClass->find('.product'));
                          $product_div = $divClass->find('.product');
                         
                          for($pno=0;$pno<$size;$pno++ ){
                              $answer['products'][$pno] = $product_div[$pno]->find('a')[0]->getAttribute('href');

                          } 
                          $products = array();
                          for($loop=0;$loop<$size;$loop++){
                              // title
                              $context = stream_context_create(
                                  array(
                                      "http" => array(
                                          "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                                      )
                                  )
                       
                              );
                              $dom = file_get_html($answer['products'][$loop], 'false', $context);
                              if(!empty($dom)) {
                                  $divClass = $title ='';$i = 0;
                                  foreach($dom->find("#main") as $divClass) {
                                      
                                      foreach($divClass->find(".product_title") as $title ) {
                                          $products[$loop]['title'] = $title->plaintext;
                                          break;
                                      }


                                      if ( '' == $products[$loop]['title']) {
                                          foreach($divClass->find(".product-title") as $title ) {
                                              $products[$loop]['title'] = $title->plaintext;
                                              break;
                                          }
                                      }
                                      //price
                                      foreach($divClass->find('.price') as $price ) {
                                          $products[$loop]['price'] = trim($price->plaintext);
                                          break;
                                      }

                                      if ('' == $products[$loop]['price']) {
                                          $products[$loop]['price'] = '';

                                      }
                                      //content
                                      foreach($divClass->find('.woocommerce-product-details__short-description') as $content ) {
                                          $products[$loop]['content'] = trim($content->plaintext);
                                          break;
                                      }


                                      if ( '' == $products[$loop]['content']) {
                                          //content
                                          foreach($divClass->find('.product-short-description') as $content ) {
                                              $products[$loop]['content'] = trim($content->plaintext);
                                              break;
                                          }
                                      }

                                      if ( '' == $products[$loop]['content']) {
                                          //content
                                          foreach($divClass->find('#tab-description') as $content ) {
                                              $products[$loop]['content'] = trim($content->plaintext);
                                              break;
                                          }
                                      }
                                      if ( '' == $products[$loop]['sku']) {
                                          //content
                                          foreach($divClass->find('.sku') as $sku ) {
                                              $products[$loop]['sku'] = trim($sku->plaintext);
                                              break;
                                          }
                                      }

                                      //main image 
                                      foreach($divClass->find('.wp-post-image') as $image ) {
                                          $products[$loop]['image'] = trim($image);
                                          break;
                                      }
                                      //extra image 
                                      if(sizeof($divClass->find('div[class=woocommerce-product-gallery__image]')) > 1){
                                          $sizeimg=sizeof($divClass->find('div[class=woocommerce-product-gallery__image]'));
                                          for($imgnum=1;$imgnum<$sizeimg;$imgnum++ ){
                                              $products[$loop]['extimage'][$imgnum] = $divClass->find('div[class=woocommerce-product-gallery__image]\a\img')[$imgnum]->src;
                                          }
                                      }
                                      //variations_form
                                      foreach ($divClass->find('form[class=variations_form]') as $variation ) {
                                          $products[$loop]['variation'] = trim($variation->getAttribute('data-product_variations'));
                                      } 
                                  }
                              }    
                          }
                      }
                  }
                  $Result=array($products,'shop');
                  echo json_encode($Result);
              }

        public function scrape_product($link) {
            $context = stream_context_create(
                array(
                    "http" => array(
                        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                    )
                )
            );
            // Fetch the HTML content
              $htmlContent = file_get_contents($link, false, $context);

              // update_option('scraped_html', $htmlContent);
              $dom = str_get_html($htmlContent);

            $answer = array();
            if(!empty($dom)) {
                // wp_optioin('dom',$dom);
                $divClass = $title  = $answer['title'] = '';$i = 0;

                foreach($dom->find(".type-product") as $divClass) {
                    foreach($divClass->find('form[class=variations_form]') as $variation ){
                          $answer['variation'] = $variation->getAttribute('data-product_variations');
                        break;

                    }
                   
                    
                    //title
                    foreach($divClass->find(".product_title") as $title ) {
                        $answer['title'] = $title->plaintext;
                        break;
                    }

                    if ( '' == $answer['title']) {
                        foreach($divClass->find(".product-title") as $title ) {
                            $answer['title'] = $title->plaintext;
                            break;
                        }
                    }
                    //price
                   foreach($divClass->find('.price') as $price ) {
                       $answer['price'] = html_entity_decode(trim($price->plaintext), ENT_QUOTES);

                       break;

                   }


                    if ('' == $answer['price']) {
                        $answer['price'] = '';
                    }

                    $answer['short_description'] = "";
                    foreach ($divClass->find('.woocommerce-product-details__short-description') as $short_description) {
                        $answer['short_description'] = $answer['short_description'] . trim($short_description->plaintext);
                    }

                    $answer['sku'] = "";
                    foreach ($divClass->find('.sku') as $sku) {
                        $answer['sku'] = $answer['sku'] . trim($sku->plaintext);
                    }
                    

                    //content
                    foreach($divClass->find('.woocommerce-Tabs-panel--description p') as $content ) {
                        $answer['content'] = trim($content->plaintext);
                        break;
                    }

    

                    //main image 
                    foreach($divClass->find('.wp-post-image') as $image ) {
                        $answer['image'] = trim($image);
                        break;
                    }

                    // if ('' == $answer['image']) {
                    //    //main image
                    //     foreach($divClass->find('img') as $image ) {
                    //         $answer['image'] = trim($image->src);
                    //         break;
                    //     } 
                    // }
                    //extra image 
                    if(sizeof($divClass->find('div[class=woocommerce-product-gallery__image]') > 1))
                        {
                        $size=sizeof($divClass->find('div[class=woocommerce-product-gallery__image]'));
                        for($imgnum=1;$imgnum<$size;$imgnum++ ){
                            $answer['extimage'][$imgnum] = $divClass->find('div[class=woocommerce-product-gallery__image]\a\img')[$imgnum]->src; 
                        }

                      
                    }
                   
                    
                    $i++;
                    break;
                }
            }

          
            $Result=array($answer,'product');
            echo json_encode($Result);
        }

       
        public function scrape_post($link){

                 $context = stream_context_create(array(
                     "http" => array(
                         "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                     )
                 ));

                 $answer = array();
                 $Result = array();

                 $dom = file_get_html($link, 'false', $context);

                 if (!empty($dom)) {
                     foreach ($dom->find("#main") as $divClass) {
                         foreach ($divClass->find(".entry-title") as $title) {
                             $answer['title'] = $title->plaintext;
                             break;
                         }

                         foreach ($divClass->find('div[class=entry-content]') as $content) {
                             foreach ($content->children() as $child) {
                                 $answer['content'][] = array(
                                     'content' => htmlspecialchars_decode($child->outertext)

                                 );
                                 
                             }
                             //print_r($answer['content']);
                             //die();
                         }

                    
                         foreach ($divClass->find('img[class=wp-post-image]') as $image) {
                             $answer['image'] = trim($image->src);
                             break;
                         }
                     }
                 }

                 $Result = array($answer, 'post');

                 if (isset($_POST['postTitle']) && isset($_POST['postContent']) && isset($_POST['postImage'])) {
                     $titleSelector = '.' . $_POST['postTitle'];
                     $contentSelector = '.' . $_POST['postContent'];
                     $imageSelector = $_POST['postImage'];

                     $dom = file_get_html($link, false, $context);

                     if (!empty($dom)) {
                         foreach ($dom->find("body") as $divClass) {
                             foreach ($divClass->find($titleSelector) as $title) {
                                 $answer['title'] = $title->plaintext;
                                 break;
                             }

            

                           foreach ($divClass->find($contentSelector) as $content) {
                               foreach ($content->children() as $child) {
                                   $answer['content'][] = array(
                                       'content' => htmlspecialchars_decode($child->outertext)

                                   );
                                   
                               }
                               
                           }

                           


                             foreach ($divClass->find('img[class=' . $imageSelector . ']') as $image) {
                                 $answer['image'] = trim($image->src);
                                 break;
                             }
                         }
                     }

                     $Result = array($answer, 'post');
                 } 

                 echo json_encode($Result);
             }
     
     public function add_product_variations($post_id) {
         
         $TotalProducts= sizeof($_POST['data']);
         global $wpdb;
         for($i=0;$i<$TotalProducts;$i++) {
            if(isset($_POST['data'][$i]['variation'])){
                $variation = $_POST['data'][$i]['variation'];
                $variationsOfProduct = html_entity_decode($variation);
                $modifiedjson = str_replace('\\"', "'", $variationsOfProduct);
                $modifiedjson = str_replace('\ "', "'", $modifiedjson); 
                $modifiedjson = str_replace("\\'", "'", $modifiedjson); 
                $decodedArray = json_decode($modifiedjson, true);
                 // print_r($decodedArray);

                $variant_array = [];

                foreach ($decodedArray as $item) {
                    $new_array = []; 

                    foreach ($item['attributes'] as $attribute_key => $attribute_value) {
                        $new_array[$attribute_key] = $attribute_value;
                    }

                    $attribute_entry = [
                        'attributes' => $new_array,
                        'display_price' => $item['display_price'],
                        'display_regular_price' => $item['display_regular_price'],
                        'sku' => $item['sku']
                    ];

                    $variant_array[] = $attribute_entry; 
                }
               
                if(isset($_POST['data'][$i]['title'])){
                    
                    $title=$_POST['data'][$i]['title'];
                   
                }
                else{
                    
                    $title="none";
                }
                $menu_order=1;

                 foreach ($variant_array as $variation) {
                   
                    
                   $post_name = $title . ' - ' . implode(' - ', $variation['attributes']);
                   $post_title = $title . ' - ' . implode(' , ', $variation['attributes']);
                   $post_excerpt = array();

                   foreach ($variation['attributes'] as $attribute_key => $attribute_value) {
                       $new_attribute_key = ucfirst(str_replace(['attribute_pa_', 'attribute_'], '', $attribute_key));
                       $post_excerpt[] = "$new_attribute_key:$attribute_value";
                   }
                      
                   
                   $product_sc= wc_get_product($post_id);
                   
                   $post_excerpt = implode(', ', $post_excerpt);

                     $args = array(
                        // 'post_author' => get_current_user_id(),
                        'post_excerpt' =>  $post_excerpt,
                        'post_status' => 'publish',
                        'post_title' => $post_title,
                        'post_parent' => $post_id,
                        'post_type' => 'product_variation',
                        'post_name' => $post_name,
                        'post_content' => '',
                        'menu_order' => $menu_order,                       
                        
                     );
                    
                    
                    $args2 = array(
                        'ID' => $variation_id,
                        'post_excerpt' =>  $post_excerpt,
                        'post_status' => 'publish',
                        'post_title' =>  $post_title,
                        'post_parent' => $post_id,
                        'post_type' => 'product_variation',
                        'post_name' => $post_name,
                        'post_content' => '', 
                        'menu_order' => $menu_order,                      
                        
                     );
                    $menu_order++;
                    $variation_id = wp_insert_post($args);
                     wp_update_post($args2);
                    
                

                     if ($variation_id) {
                         foreach ($variation['attributes'] as $attribute_key => $attribute_value) {
                            update_post_meta($variation_id,  $attribute_key, $attribute_value);
                         // $product_sc->set_attribute($attribute_key, $attribute_value );
                         // $product_sc->save();
                         }
                         update_post_meta($variation_id, '_regular_price', $variation['display_regular_price']);
                         update_post_meta($variation_id, '_price', $variation['display_price']);
                         update_post_meta($variation_id, '_sku', $variation['sku']);
                     }
                     



                 }
            }
            
         }

       
      }
   


      public function post_site_data() {
          $TotalProducts = sizeof($_POST['data']);
          if ($_POST['ptype'] == 'product' || $_POST['ptype'] == 'shop') {
              global $wpdb;
              $upPrp = array();
              for ($i = 0; $i < $TotalProducts; $i++) {
                  if (isset($_POST['data'][$i]['variation'])) {
                      
                      $variation = $_POST['data'][$i]['variation'];
                      $variationsOfProduct = html_entity_decode($variation);
                      $modifiedjson = str_replace('\\"', "'", $variationsOfProduct);
                      $modifiedjson = str_replace('\\ "', "'", $modifiedjson);
                      $modifiedjson = str_replace("\'", "'", $modifiedjson);
                      $decodedArray = json_decode($modifiedjson, true);
                      $attribute_array = [];
                      $new_attribute_entry = [];
                      $is_variation = 0; // Default value

                      if (!empty($decodedArray)) {
                          
                          foreach ($decodedArray as $item) {
                              $attributes = $item['attributes'];
                              $test_attr[$i] = $item['attributes'];
                              
                              foreach ($attributes as $key => $value) {
                                  $new_key = str_replace('attribute_', '', $key);
                                  $new_attribute_entry[$new_key] = $value;
                              }

                              $attribute_array[] = $new_attribute_entry;
                          }
                          $is_variation = 1;
                      }
                     
                      // print_r($attribute_array);


                      // print_r($attributes);

                      if (isset($_POST['data'][$i]['short_description'])) {
                          $short_description = $_POST['data'][$i]['short_description'];
                      } else {
                          $short_description = "";
                      }

                      if (isset($_POST['data'][$i]['content'])) {
                          $content = $_POST['data'][$i]['content'];
                      } else {
                          $content = "";
                      }

                      if (isset($_POST['data'][$i]['title'])) {
                          $title = $_POST['data'][$i]['title'];
                      } else {
                          $title = "none";
                      }

                      if (isset($_POST['data'][$i]['sku'])) {
                          $sku = $_POST['data'][$i]['sku'];
                      } else {
                          $sku = "none";
                      }

                    if(isset($_POST['data'][$i]['price'])) {
                        $str = $_POST['data'][$i]['price'];
                     

                        $str = trim(preg_replace('/\s+/u', ' ', $str));
                       

                        // Remove any non-numeric characters except space and dot
                        $str = preg_replace('/[^0-9.\s]/', '', $str);
                       

                        // Split $str into an array using space as the delimiter
                        $res = explode(' ', $str);
                       

                        // Remove empty elements from the array
                        $res = array_filter($res);
                        
                    }

                  
                 

                      $post = array(
                          'post_author' => get_current_user_id(),
                          'post_content' => $content,
                          'post_excerpt' => $short_description,
                          'post_status' => "publish",
                          'post_title' => $title,
                          'post_parent' => '',
                          'post_type' => "product",
                      );

                      // Create post
                      $post_id = wp_insert_post($post, $wp_error);
                      // print_r($post_id);
                      $product_sc = wc_get_product($post_id);
                      $attr_array=array();
                      foreach ($attribute_array as $attribute) {
                          $position = 0;
                          foreach ($attribute as $key => $value) {
                              
                              $attr_name = $key;
                              $attr_val = $attribute[$key];
                              $taxonomy_name = $key;
                      
                              $lc_attr_name = str_replace('pa_', '', $attr_name);
                              $uc_attr_name = ucfirst($lc_attr_name);
                              if (!taxonomy_exists($taxonomy_name)) {

                                     $attribute_data = array(
                                        'name'         => $uc_attr_name,
                                        'slug'         => $lc_attr_name,
                                        'type'         => $attribute_type,
                                        'order_by'     => 'menu_order',
                                        'has_archives' => true,
                                    );

                                    // Create the attribute
                                    $attribute_id = wc_create_attribute( $attribute_data );
                            
                                    // Taxonomy doesn't exist, so let's create it
                                    $args = array(
                                        'labels' => array(
                                            'name' => $taxonomy_name,
                                            'singular_name' => $taxonomy_name,
                                        ),
                                        'public' => true,
                                        'rewrite' => array('slug' => $taxonomy_name),
                                    );

                                    register_taxonomy($taxonomy_name, 'product', $args); // Replace 'your_post_type' with the appropriate post type
                                }

                                

                              wp_set_object_terms($post_id, $attribute[$key] , $attr_name);
                              
                          if ($attr_val!=''){
                        
                            }


                            if (array_key_exists($attr_name, $attr_array)){
                               if (!is_array($attr_array[$attr_name])) {
                                $attr_array[$attr_name] = [$attr_array[$attr_name]];
                               }
                               $attr_array[$attr_name][]=$attr_val; 
                            } else {
                                $attr_array[$attr_name] = $attr_val;
                            
                            }
                        }
                          
                      }

                      foreach ($attr_array as $key => $value) {
                       wp_set_object_terms($post_id, $attr_array[$key] , $key);   
                      }
                    

                       $attributes=array();
                       foreach ($attribute_array as $attribute) {
                          $position = 0;
                          foreach ($attribute as $key => $value) {
                            //
                              $attributes[$key] = array(
                                  'name' => $key,
                                  'value' => '',
                                  'position' => $position,
                                  'is_visible' => 1,
                                  'is_variation' => $is_variation,
                                  'is_taxonomy' => 1
                              );
                              $position++;
                          }
                      }
                      
                      // print_r($attributes);
                      


                      if ($post_id) {
                          // Add variations to the product
                          $this->add_product_variations($post_id);


                          array_push($upPrp, $post_id);

                          if (isset($_POST['data'][$i]['image'])) {
                              $image_url = $_POST['data'][$i]['image'];
                              $image_name = $image_url;
                              $upload_dir = wp_upload_dir(); // Set upload folder
                              $image_data = file_get_contents($image_url); // Get image data
                              $unique_file_name = wp_unique_filename($upload_dir['path'], $image_name); // Generate unique name
                              $filename = basename($unique_file_name); // Create image file name

                              // Check folder permission and define file location
                              if (wp_mkdir_p($upload_dir['path'])) {
                                  $file = $upload_dir['path'] . '/' . $filename;
                              } else {
                                  $file = $upload_dir['basedir'] . '/' . $filename;
                              }

                              // Create the image file on the server
                              file_put_contents($file, $image_data);

                              // Check image file type
                              $wp_filetype = wp_check_filetype($filename, null);

                              // Set attachment data
                              $attachment = array(
                                  'post_mime_type' => $wp_filetype['type'],
                                  'post_title' => sanitize_file_name($filename),
                                  'post_content' => '',
                                  'post_status' => 'inherit'
                              );

                              // Create the attachment
                              $attach_id = wp_insert_attachment($attachment, $file, $post_id);

                              // Include image.php
                              require_once(ABSPATH . 'wp-admin/includes/image.php');

                              // Define attachment metadata
                              $attach_data = wp_generate_attachment_metadata($attach_id, $file);

                              // Assign metadata to attachment
                              wp_update_attachment_metadata($attach_id, $attach_data);
                          }

                          set_post_thumbnail($post_id, $attach_id);
                          add_post_meta($post_id, '_thumbnail_id', $attach_id);

                          wp_set_object_terms($post_id, 'variable', 'product_type');

                          update_post_meta($post_id, '_visibility', 'visible');
                          update_post_meta($post_id, '_stock_status', 'instock');
                          update_post_meta($post_id, 'total_sales', '0');
                          update_post_meta($post_id, '_downloadable', 'no');
                          update_post_meta($post_id, '_virtual', 'no');
                          update_post_meta($post_id, '_purchase_note', "");
                          update_post_meta($post_id, '_featured', "no");
                          update_post_meta($post_id, '_weight', "");
                          update_post_meta($post_id, '_length', "");
                          update_post_meta($post_id, '_width', "");
                          update_post_meta($post_id, '_height', "");
                          update_post_meta($post_id, '_sku', $sku);
                          update_post_meta($post_id, '_product_attributes', $attributes);
                          update_post_meta($post_id, '_sale_price_dates_from', "");
                          update_post_meta($post_id, '_sale_price_dates_to', "");
                          add_post_meta($post_id, '_price', $res[1]);
                          add_post_meta($post_id, '_price', $res[4]);
                          update_post_meta($post_id, '_sold_individually', "");
                          update_post_meta($post_id, '_manage_stock', "no");
                          update_post_meta($post_id, '_backorders', "no");
                          update_post_meta($post_id, '_stock', "");
                          update_post_meta($post_id, '_download_limit', '');
                          update_post_meta($post_id, '_download_expiry', '');
                          update_post_meta($post_id, '_download_type', '');

                          if (isset($_POST['data'][$i]['extimage'])) {
                              $extimagesize = sizeof($_POST['data'][$i]['extimage']);
                              $imgids = array();
                              for ($loop = 1; $loop <= $extimagesize; $loop++) {
                                  $image_url = $_POST['data'][$i]['extimage'][$loop];
                                  $image_name = $image_url;
                                  $upload_dir = wp_upload_dir(); // Set upload folder
                                  $image_data = file_get_contents($image_url); // Get image data
                                  $unique_file_name = wp_unique_filename($upload_dir['path'], $image_name); // Generate unique name
                                  $filename = basename($unique_file_name); // Create image file name

                                  // Check folder permission and define file location
                                  if (wp_mkdir_p($upload_dir['path'])) {
                                      $file = $upload_dir['path'] . '/' . $filename;
                                  } else {
                                      $file = $upload_dir['basedir'] . '/' . $filename;
                                  }

                                  // Create the image file on the server
                                  file_put_contents($file, $image_data);

                                  // Check image file type
                                  $wp_filetype = wp_check_filetype($filename, null);

                                  // Set attachment data
                                  $attachment = array(
                                      'post_mime_type' => $wp_filetype['type'],
                                      'post_title' => sanitize_file_name($filename),
                                      'post_content' => '',
                                      'post_status' => 'inherit'
                                  );

                                  // Create the attachment
                                  $attach_id = wp_insert_attachment($attachment, $file, $post_id);

                                  // Include image.php
                                  require_once(ABSPATH . 'wp-admin/includes/image.php');

                                  // Define attachment metadata
                                  $attach_data = wp_generate_attachment_metadata($attach_id, $file);

                                  // Assign metadata to attachment
                                  wp_update_attachment_metadata($attach_id, $attach_data);
                                  array_push($imgids, $attach_id);
                              }

                              $join_string = implode(", ", $imgids);
                              update_post_meta($post_id, '_product_image_gallery', $join_string);
                          } else {
                              update_post_meta($post_id, '_product_image_gallery', '');
                          }
                      }
                  }
                    else {
                                  if (isset($_POST['data'][$i]['content'])) {
                                      $content = $_POST['data'][$i]['content'];
                                  } else {
                                      $content = "";
                                  }

                                  if (isset($_POST['data'][$i]['title'])) {
                                      $title = $_POST['data'][$i]['title'];
                                  } else {
                                      $title = "none";
                                  }
                                  if(isset($_POST['data'][$i]['sku'])){
                                        $sku=$_POST['data'][$i]['sku'];
                                       
                                    }
                                    else{
                                        
                                        $sku="none";
                                    }
                                 if(isset($_POST['data'][$i]['price'])) {
                                     $str = $_POST['data'][$i]['price'];

                                     // Use regular expression to extract decimal numbers with optional commas
                                     preg_match_all('/\d{1,3}(?:,\d{3})*\.\d+/', $str, $matches);

                                     // $matches[0] will contain all the matched decimal numbers
                                     $res = $matches[0];
                                 }


                                  $post = array(
                                      'post_author' => get_current_user_id(),
                                      'post_content' => $content,
                                      'post_status' => "publish",
                                      'post_title' => $title,
                                      'post_parent' => '',
                                      'post_type' => "product",
                                  );

                                  // Create post
                                  $post_id = wp_insert_post($post, $wp_error);

                                  if ($post_id) {
                                      array_push($upPrp, $post_id);

                                      if (isset($_POST['data'][$i]['image'])) {
                                          $image_url = $_POST['data'][$i]['image'];
                                          $image_name = $image_url;
                                          $upload_dir = wp_upload_dir(); // Set upload folder
                                          $image_data = file_get_contents($image_url); // Get image data
                                          $unique_file_name = wp_unique_filename($upload_dir['path'], $image_name); // Generate unique name
                                          $filename = basename($unique_file_name); // Create image file name

                                          // Check folder permission and define file location
                                          if (wp_mkdir_p($upload_dir['path'])) {
                                              $file = $upload_dir['path'] . '/' . $filename;
                                          } else {
                                              $file = $upload_dir['basedir'] . '/' . $filename;
                                          }

                                          // Create the image file on the server
                                          file_put_contents($file, $image_data);

                                          // Check image file type
                                          $wp_filetype = wp_check_filetype($filename, null);

                                          // Set attachment data
                                          $attachment = array(
                                              'post_mime_type' => $wp_filetype['type'],
                                              'post_title' => sanitize_file_name($filename),
                                              'post_content' => '',
                                              'post_status' => 'inherit'
                                          );


                                          // Create the attachment
                                          $attach_id = wp_insert_attachment($attachment, $file, $post_id);

                                          // Include image.php
                                          require_once(ABSPATH . 'wp-admin/includes/image.php');

                                          // Define attachment metadata
                                          $attach_data = wp_generate_attachment_metadata($attach_id, $file);

                                          // Assign metadata to attachment
                                          wp_update_attachment_metadata($attach_id, $attach_data);

                                          set_post_thumbnail($post_id, $attach_id);
                                          add_post_meta($post_id, '_thumbnail_id', $attach_id);
                                      }

                                      wp_set_object_terms($post_id, 'simple', 'product_type');

                                      update_post_meta($post_id, '_visibility', 'visible');
                                      update_post_meta($post_id, '_stock_status', 'instock');
                                      update_post_meta($post_id, 'total_sales', '0');
                                      update_post_meta($post_id, '_downloadable', 'no');
                                      update_post_meta($post_id, '_virtual', 'no');
                                      update_post_meta($post_id, '_regular_price', $res[0]);
                                      update_post_meta($post_id, '_sale_price', $res[1]);
                                      update_post_meta($post_id, '_purchase_note', "");
                                      update_post_meta($post_id, '_featured', "no");
                                      update_post_meta($post_id, '_weight', "");
                                      update_post_meta($post_id, '_length', "");
                                      update_post_meta($post_id, '_width', "");
                                      update_post_meta($post_id, '_height', "");
                                      update_post_meta($post_id, '_sku',  $sku);
                                      update_post_meta($post_id, '_product_attributes', array());
                                      update_post_meta($post_id, '_sale_price_dates_from', "");
                                      update_post_meta($post_id, '_sale_price_dates_to', "");
                                      if(count($res) == 1) {
                                          update_post_meta($post_id, '_price', $res[0]);
                                      } else {
                                          update_post_meta($post_id, '_price', $res[1]);
                                      }
                                      update_post_meta($post_id, '_sold_individually', "");
                                      update_post_meta($post_id, '_manage_stock', "no");
                                      update_post_meta($post_id, '_backorders', "no");
                                      update_post_meta($post_id, '_stock', "");
                                      update_post_meta($post_id, '_download_limit', '');
                                      update_post_meta($post_id, '_download_expiry', '');
                                      update_post_meta($post_id, '_download_type', '');

                                      if (isset($_POST['data'][$i]['extimage'])) {
                                          $extimagesize = sizeof($_POST['data'][$i]['extimage']);
                                          $imgids = array();
                                          for ($loop = 1; $loop <= $extimagesize; $loop++) {
                                              $image_url = $_POST['data'][$i]['extimage'][$loop];
                                              $image_name = $image_url;
                                              $upload_dir = wp_upload_dir(); // Set upload folder
                                              $image_data = file_get_contents($image_url); // Get image data
                                              $unique_file_name = wp_unique_filename($upload_dir['path'], $image_name); // Generate unique name
                                              $filename = basename($unique_file_name); // Create image file name

                                              // Check folder permission and define file location
                                              if (wp_mkdir_p($upload_dir['path'])) {
                                                  $file = $upload_dir['path'] . '/' . $filename;
                                              } else {
                                                  $file = $upload_dir['basedir'] . '/' . $filename;
                                              }

                                              // Create the image file on the server
                                              file_put_contents($file, $image_data);

                                              // Check image file type
                                              $wp_filetype = wp_check_filetype($filename, null);

                                              // Set attachment data
                                              $attachment = array(
                                                  'post_mime_type' => $wp_filetype['type'],
                                                  'post_title' => sanitize_file_name($filename),
                                                  'post_content' => '',
                                                  'post_status' => 'inherit'
                                              );

                                              // Create the attachment
                                              $attach_id = wp_insert_attachment($attachment, $file, $post_id);

                                              // Include image.php
                                              require_once(ABSPATH . 'wp-admin/includes/image.php');

                                              // Define attachment metadata
                                              $attach_data = wp_generate_attachment_metadata($attach_id, $file);

                                              // Assign metadata to attachment
                                              wp_update_attachment_metadata($attach_id, $attach_data);
                                              array_push($imgids, $attach_id);
                                          }

                                          $join_string = implode(", ", $imgids);
                                          update_post_meta($post_id, '_product_image_gallery', $join_string);
                                      } else {
                                          update_post_meta($post_id, '_product_image_gallery', '');
                                      }
                                        
                                  }

                              } 
             
                   if($post_id){
                        echo 'Products Uploaded Successfully';
                      }
                      else{
                          echo 'Product Upload Failed';
                      }
              }

          }
                    else if ($_POST['ptype'] == 'post') {
              for ($i = 0; $i < $TotalProducts; $i++) {
                  if (isset($_POST['data'][$i]['content'])) {
                      $content = $_POST['data'][$i]['content'];
                      

                  } else {
                      $content = "";
                  }

                  if (isset($_POST['data'][$i]['title'])) {
                      $title = $_POST['data'][$i]['title'];
                  } else {
                      $title = "none";
                  }
                
                  // Assuming $content is the array you provided
                  $post_content = '';

                  foreach ($content as $item) {
                      $post_content .= $item['content'];
                  }

                  global $user_ID;

                  $new_post = array(
                      'post_title' => $title,
                      'post_content' => $post_content, 
                      'post_status' => 'publish',
                      'post_date' => date('Y-m-d H:i:s'),
                      'post_author' => $user_ID,
                      'post_type' => 'post',
                      'post_category' => array(0)
                  );

                  $post_id = wp_insert_post($new_post);



                  if (isset($_POST['data'][$i]['image'])) {
                      $image_url=   $_POST['data'][$i]['image'];
                      $image_name       = $image_url;
                      $upload_dir       = wp_upload_dir(); 
                      $image_data       = file_get_contents($image_url); // Get image data
                      $unique_file_name = wp_unique_filename( $upload_dir['path'], $image_name ); // Generate unique name
                      $filename         = basename( $unique_file_name ); // Create image file name

                      // Check folder permission and define file location
                      if( wp_mkdir_p( $upload_dir['path'] ) ) {
                          $file = $upload_dir['path'] . '/' . $filename;
                      } else {
                          $file = $upload_dir['basedir'] . '/' . $filename;
                      }

                      // Create the image  file on the server
                      file_put_contents( $file, $image_data );

                      // Check image file type
                      $wp_filetype = wp_check_filetype( $filename, null );

                      // Set attachment data
                      $attachment = array(
                          'post_mime_type' => $wp_filetype['type'],
                          'post_title'     => sanitize_file_name( $filename ),
                          'post_content'   => '',
                          'post_status'    => 'inherit'
                      );

                      // Create the attachment
                      $attach_id = wp_insert_attachment( $attachment, $file, $post_id );

                      // Include image.php
                      require_once(ABSPATH . 'wp-admin/includes/image.php');

                      // Define attachment metadata
                      $attach_data = wp_generate_attachment_metadata( $attach_id, $file );

                      // Assign metadata to attachment
                      wp_update_attachment_metadata( $attach_id, $attach_data );
                      set_post_thumbnail( $post_id, $attach_id );
                  }

                  if ($post_id) {
                      echo 'Post Uploaded Successfully';
                  } else {
                      echo 'Post Upload Failed';
                  }
              }
          }
     

          //           else if ($_POST['ptype'] == 'post') {
          //     for ($i = 0; $i < $TotalProducts; $i++) {
          //         if (isset($_POST['data'][$i]['content'])) {
          //             $content = $_POST['data'][$i]['content'];
          //         } else {
          //             $content = "";
          //         }

          //         if (isset($_POST['data'][$i]['title'])) {
          //             $title = $_POST['data'][$i]['title'];
          //         } else {
          //             $title = "none";
          //         }

          //         if (isset($_POST['data'][$i]['sections'])) {
          //             $sections = $_POST['data'][$i]['sections'];
          //             $post_content = '';

          //             foreach ($sections as $section) {
          //                 if (isset($section['heading'])) {
          //                     $post_content .= '<h2>' . $section['heading'] . '</h2>';
          //                 }

          //                 if (isset($section['paragraphs'])) {
          //                     foreach ($section['paragraphs'] as $paragraph) {
          //                         $post_content .= '<p>' . $paragraph . '</p>';
          //                     }
          //                 }
          //                 if (isset($section['images'])) {
          //                     foreach ($section['images'] as $image_url) {
          //                         // Insert the image into the post content
          //                         $post_content .= '<img src="' . $image_url . '">';
          //                     }
          //                 }


          //             }
          //         }

          //         global $user_ID;
          //         $new_post = array(
          //             'post_title' => $title,
          //             'post_content' => $post_content,
          //             'post_status' => 'publish',
          //             'post_date' => date('Y-m-d H:i:s'),
          //             'post_author' => $user_ID,
          //             'post_type' => 'post',
          //             'post_category' => array(0)
          //         );

          //         $post_id = wp_insert_post($new_post);

          //         if (isset($_POST['data'][$i]['image'])) {
          //             // print_r("post working");
                    // $image_url=   $_POST['data'][$i]['image'];
                    // $image_name       = $image_url;
                    // $upload_dir       = wp_upload_dir(); 
                    // $image_data       = file_get_contents($image_url); // Get image data
                    // $unique_file_name = wp_unique_filename( $upload_dir['path'], $image_name ); // Generate unique name
                    // $filename         = basename( $unique_file_name ); // Create image file name

                    // // Check folder permission and define file location
                    // if( wp_mkdir_p( $upload_dir['path'] ) ) {
                    //     $file = $upload_dir['path'] . '/' . $filename;
                    // } else {
                    //     $file = $upload_dir['basedir'] . '/' . $filename;
                    // }

                    // // Create the image  file on the server
                    // file_put_contents( $file, $image_data );

                    // // Check image file type
                    // $wp_filetype = wp_check_filetype( $filename, null );

                    // // Set attachment data
                    // $attachment = array(
                    //     'post_mime_type' => $wp_filetype['type'],
                    //     'post_title'     => sanitize_file_name( $filename ),
                    //     'post_content'   => '',
                    //     'post_status'    => 'inherit'
                    // );

                    // // Create the attachment
                    // $attach_id = wp_insert_attachment( $attachment, $file, $post_id );

                    // // Include image.php
                    // require_once(ABSPATH . 'wp-admin/includes/image.php');

                    // // Define attachment metadata
                    // $attach_data = wp_generate_attachment_metadata( $attach_id, $file );

                    // // Assign metadata to attachment
                    // wp_update_attachment_metadata( $attach_id, $attach_data );
                    // set_post_thumbnail( $post_id, $attach_id );

                                                
          //         }

          //         if ($post_id) {
          //             echo 'Products Uploaded Successfully';
          //         } else {
          //             echo 'Product Upload Failed';
          //         }
          //     }
          // }



          die();
      }



        public function custom_scrapper_setting(){
            ?>
                 <style type="text/css">
                .spinner {
                    position: fixed;
                    visibility: visible !important;
                    top: 50%;
                    left: 50%;
                    margin-left: -50px;
                    margin-top: -50px; 
                    text-align:center;
                    z-index:1234;
                    overflow: auto;
                    width: 100px; 
                    height: 102px; 
                }

            </style>
                <div id="spinner" class="spinner" style="display: none;">
                    <img id="img-spinner" src="//localhost/wordpress/wp-content/plugins/wp_scraper/admin/style/805.gif" alt="Loading" height="42" width="42"/>
                </div>

            <div id='section' class='bootstrap-iso'>
                <h1>Extendons Custom Site Scrapper</h1><br>
                 <p><i><?php _e('Start Id name with "#" and Class name with "."','wps_text');?></i></p>

                <div class="form-inline">
                    <label for="c_id" class="col-2 col-form-label" style="width: 16%;"><?php _e('Container Id/Class:','wps_text');?></label>
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" id="c_id" name='c_id'>
                     <a href="<?php echo plugin_dir_url(__FILE__); ?>assets/images/Container/Container.gif" target="_blank" rel="noopener noreferrer"><?php _e('Help','wps_text');?></a>
                </div>
                <br>


                <div class="form-inline">
                    <label for="c_title" class="col-2 col-form-label" style="width: 16%;"><?php _e('Product Title Id/Class:','wps_text');?></label>
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" id="c_title" name='c_title'>
                     <a href="<?php echo plugin_dir_url(__FILE__); ?>assets/images/Title/Title.gif" target="_blank" rel="noopener noreferrer"><?php _e('Help','wps_text');?></a>
                   
                </div>
                <br>
                <div class="form-inline">
                    <label for="c_price" class="col-2 col-form-label" style="width: 16%;"><?php _e('Product Price Id/Class:','wps_text');?></label>
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" id="c_price" name='c_price'>
                     <a href="<?php echo plugin_dir_url(__FILE__); ?>assets/images/Price/Price.gif" target="_blank" rel="noopener noreferrer"><?php _e('Help','wps_text');?></a>
                   
                </div>
                <br>
                <div class="form-inline">
                    <label for="c_desp" class="col-2 col-form-label" style="width: 16%;"><?php _e('Product Description Id/Class:','wps_text');?></label>
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" id="c_desp" name='c_desp'>
                     <a href="<?php echo plugin_dir_url(__FILE__); ?>assets/images/Description/Description.gif" target="_blank" rel="noopener noreferrer"><?php _e('Help','wps_text');?></a>
                   
                </div>
                <br>
                <div class="form-inline">
                    <label for="c_image" class="col-2 col-form-label" style="width: 16%;"><?php _e('Product Image Id/Class:','wps_text');?></label>
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" id="c_image" name='c_image'>
                     <a href="<?php echo plugin_dir_url(__FILE__); ?>assets/images/Image/Image.gif" target="_blank" rel="noopener noreferrer"><?php _e('Help','wps_text');?></a>
                   
                </div>
                <br>
                <div class="form-inline">
                    <label for="link" class="col-2 col-form-label" style="width: 16%;"><?php _e('Target link:','wps_text');?></label>
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 40%;" id="link" name='link'>
                    <label  for="ddtype"><?php _e('Select Type','wps_text');?></label>
                    <select  id="ddtype" name='ddtype' required>
                        <option ><?php _e('Choose...','wps_text');?></option>
                      <!--   <option value="post">Single Post Page</option> -->
                        <option value="product"><?php _e('Single Product Page','wps_text');?></option>
                        <!-- <option value="shop"><?php _e('Shop/Category Page','wps_text');?></option> -->
                    </select>
                    <button type="button" id='btnSeach' class="btn btn-primary" onclick="c_scrape();"><?php _e('Search','wps_text');?></button>
                </div>
                <br>
                <input type="hidden" id="frmdata" name='frmdata' value="">
                <div class="container" id='container' style='background-color: grey;display: none'>
                    <h3>Result:</h3>
                    <div class="well well-lg" id='data'></div>
                   <button type="Button" class="btn btn-success" style="margin-bottom: 10px;" id='import_data' onclick="ImportData('product');"><?php _e('Import','wps_text');?></button>
                   <!-- <button type="Button" class="btn btn-success" style="margin-bottom: 10px;" id='import_data' onclick="ImportData('csv');">Import As CSV</button> -->
                </div>
               
            </div>
            <script type="text/javascript">
                 jQuery(document).ready(function(){
                    jQuery("#spinner").bind("ajaxSend", function() {
                        jQuery("#btnSeach").attr("disabled", true);
                        jQuery("#import_data").attr("disabled", true);
                        jQuery(this).show();
                    }).bind("ajaxStop", function() {
                        jQuery("#btnSeach").removeAttr("disabled");
                        jQuery("#import_data").removeAttr("disabled");
                        jQuery(this).hide();
                    }).bind("ajaxError", function() {
                        jQuery("#btnSeach").removeAttr("disabled");
                        jQuery("#import_data").removeAttr("disabled");

                        jQuery(this).hide();
                    });
             
                });
                function ImportData(type){
                    jQuery('#spinner').show();
                    var chkArray = [];
                    jQuery(".chk:checked").each(function() {
                        chkArray.push(jQuery(this).val());
                    });

                    // alert(chkArray.length);
                    var arraydata = [];
                    var chkArraySize= chkArray.length;
                    if(chkArraySize == 0){
                        alert('Please Select Product');
                        return;
                    }
                    for(var i=0;i<chkArraySize;i++){
                        if(chkArraySize == 1){
                            if(!jQuery.parseJSON(jQuery('#frmdata').val())[0].length){
                                arraydata.push(jQuery.parseJSON(jQuery('#frmdata').val())[0]);
                            }else{
                                arraydata.push(jQuery.parseJSON(jQuery('#frmdata').val())[0][chkArray]);
                            }
                        }else if(chkArraySize > 1){
                            arraydata.push(jQuery.parseJSON(jQuery('#frmdata').val())[0][chkArray[i]]);
                        }
                    }

                    // console.log(arraydata)
                    arraydata.forEach((val,ind,arr)=>{
                        val.price = val.price.replace('&#36; ', '');
                        val.price = val.price.replace('&#36;', '');
                       
                    })




                    var ajaxurl = "<?php echo admin_url( 'admin-ajax.php'); ?>";
                    jQuery.ajax({
                        url : ajaxurl,
                        type : 'post',
                        data : {
                            action : 'post_data',
                            data :arraydata,
                            ptype:type,
                        },
                        success : function( response ) {
                            // console.log(response);
                            // alert(response);

                            jQuery('#spinner').hide();

                        }
                    });  
                }

                function c_scrape() {

                    var link=document.getElementById("link").value;
                    var dtype=document.getElementById("ddtype").value;
                    var c_id=document.getElementById("c_id").value;
                    var title=document.getElementById("c_title").value;
                    var price=document.getElementById("c_price").value;
                    var desp=document.getElementById("c_desp").value;
                    var image=document.getElementById("c_image").value;
                    get_custom_data(link,dtype,c_id,title,price,desp,image);
                }

                function get_custom_data(link,dtype,c_id,title,price,desp,image) {
                    jQuery('#spinner').show();

                    var ajaxurl = "<?php echo admin_url( 'admin-ajax.php'); ?>";
                    jQuery.ajax({
                        url : ajaxurl,
                        type : 'post',
                        data : {
                            action : 'scrape_custom_data',
                            link :link,
                            dtype: dtype,
                            c_id :c_id,
                            title: title,
                            price :price,
                            desp: desp,
                            image :image,
                        },
                        success : function( response ) {
                           
                            console.log(response);
                            return;
                            var vae=jQuery.parseJSON(response);

                            jQuery('#frmdata').val(response);

                            //<input id="selectall" onclick="selectAll();" class="checkbox checkbox-primary styled" type="checkbox" >
                            htmldata='<table><tr><th width="50px">Select</th><th>Name</th><th>Price</th><th style="width:63%;">Content</th><th>Image</th></tr>';
                            
                            if(vae[1]=='product'){
                                htmldata+= '<tr><td><input id="0" value="0"class="chk checkbox checkbox-primary styled" type="checkbox"></td><td><p style="width:100%;">'+vae[0].title+'</p></td><td><p style="width: 100%;">'+vae[0].price+'</p></td><td><p style="width: 100%;">'+vae[0].content+'</p></td><td><img id="pimage" width="100px" height="100px"src="'+vae[0].image+'" class="img-rounded"></td></tr></table>';
                                jQuery('#data').html(htmldata);
                            }
                            else if(vae[1]=='shop'){
                                var size=vae[0].length;
                                for(var i=0;i<size;i++){
                                 htmldata += '<tr><td><input id="'+i+'" value="'+i+'" class="chk checkbox checkbox-primary styled" type="checkbox"></td><td><label>'+vae[0][i].title+'</label></td><td><label >'+vae[0][i].price+'</label></td><td><label >'+vae[0][i].content+'</label></td><td><img id="pimage" width="100px" height="100px"src="'+vae[0][i].image+'" class="img-rounded"></td></tr>';   
                                }
                                jQuery('#data').html(htmldata+'</table>');
                            }
                            else if(vae[1]=='post'){
                            

                            }
                            // console.log(jQuery.parseJSON(vae[0].variation));
                            jQuery('#spinner').hide();

                            jQuery('#container').show();
                        }
                    });  
                }

            </script>
            <?php
        }

        public function wp_scrapper_setting(){
            ?>
            <style type="text/css">
                .spinner {
                    position: fixed;
                    visibility: visible !important;
                    top: 50%;
                    left: 50%;
                    margin-left: -50px; /* half width of the spinner gif */
                    margin-top: -50px; /* half height of the spinner gif */
                    text-align:center;
                    z-index:1234;
                    overflow: auto;
                    width: 100px; /* width of the spinner gif */
                    height: 102px; /*hight of the spinner gif +2px to fix IE8 issue */
                }

            </style>
             <div id="spinner" class="spinner" style="display: none;">
                    <img id="img-spinner"  alt="Loading" height="42" width="42"/>
                </div>
            <div id='section' class='bootstrap-iso'>
               
                <h1>Extendons WP Scrapper</h1><br>
                <div class="form-inline">
                    <label for="link" class="col-2 col-form-label"><?php _e('Target link:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" id="link" name='link'><br><br>
                    <label  for="ddtype"><?php _e('Select Type:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                   
                    <select  id="ddtype" name='ddtype'  class="form-control mb-2 mr-sm-2 mb-sm-0" style="width: 20%;" onchange="changePageType(this.value)" required>
                        <option ><?php _e('Choose...','wps_text');?></option>
                        <option value="post"><?php _e('Single Post Page','wps_text');?></option>
                        <option value="product"><?php _e('Single Product Page','wps_text');?></option>
                        <option value="shop"><?php _e('Shop/Category Page','wps_text');?></option>
                    </select><br><br>
                  <div id="checkClasses">
                      <label for="checkClasses" class="col-2 col-form-label"><?php _e('If products are not scrapable directly, please check the checkbox and provide further details:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <input type="checkbox" class="form-check-input checkBoxClasses" name="checkClasses" id="checkBoxClasses">
                  </div>

                  <div id="postPageContent">
                      <label for="title_id" class="col-2 col-form-label"><?php _e('Title Class:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0 title_id" style="width: 20%;"  name='title_id'><br><br>
                     <!--  <label for="price_id" class="col-2 col-form-label"><?php _e('Price Class:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0 price_id" style="width: 20%;"  name='price_id'><br><br> -->
                      <label for="content_id" class="col-2 col-form-label"><?php _e('Content Class:','wps_text');?></label>&nbsp;&nbsp;&nbsp;
                      <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0 content_id" style="width: 20%;" name='content_id'><br><br>
                     <!--  <label for="sku_id" class="col-2 col-form-label"><?php _e('SKU Class:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0 sku_id" style="width: 20%;" name='sku_id'><br><br> -->
                      <label for="image_id" class="col-2 col-form-label"><?php _e('Image Class:','wps_text');?></label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <input type="text" class="form-control mb-2 mr-sm-2 mb-sm-0 image_id" style="width: 20%;"  name='image_id'><br><br>
                  </div>
                    <button type="button" id='btnSeach' class="btn btn-primary" onclick="scrape();"><?php _e('Search','wps_text');?></button>
                </div>
                <br><br>
                <input type="hidden" id="frmdata" name='frmdata' value="">
                <div class="container" id='container' style='background-color: grey;display: none'>
                    <h3><?php _e('Result:','wps_text');?></h3>
                    <div class="well well-lg" id='data'></div>
                   <button type="Button" class="btn btn-success" style="margin-bottom: 10px;" id='import_data' onclick="ImportData();"><?php _e('Import','wps_text');?></button>
                  <!--  <button type="Button" class="btn btn-success" style="margin-bottom: 10px;" id='import_data' onclick="ImportData('csv');">Import As CSV</button> -->
                </div>
               
            </div>

           
            <script type="text/javascript">
               
                jQuery(document).ready(function(){
                    jQuery("#spinner").bind("ajaxSend", function() {
                        jQuery("#btnSeach").attr("disabled", true);
                        jQuery("#import_data").attr("disabled", true);
                        jQuery(this).show();
                    }).bind("ajaxStop", function() {
                        jQuery("#btnSeach").removeAttr("disabled");
                        jQuery("#import_data").removeAttr("disabled");
                        jQuery(this).hide();
                    }).bind("ajaxError", function() {
                        jQuery("#btnSeach").removeAttr("disabled");
                        jQuery("#import_data").removeAttr("disabled");

                        jQuery(this).hide();
                    });
             
                });

                function scrape() {

                    var link=document.getElementById("link").value;
                    var dtype=document.getElementById("ddtype").value;
                    get_data(link,dtype);
                }
                
                function ImportData(){
                    var type=jQuery.parseJSON(jQuery('#frmdata').val())[1];//product type


                    var chkArray = [];
                    jQuery(".chk:checked").each(function() {
                        chkArray.push(jQuery(this).val());
                    });
                    // alert(chkArray.length);
                    var arraydata = [];
                    var chkArraySize= chkArray.length;
                    if(chkArraySize == 0){
                        alert('Please Select Product');
                        return;
                    }
                    // alert("Frmdata" +" "+jQuery('#frmdata').val());
                    for(var i=0;i<chkArraySize;i++){
                        if(chkArraySize == 1){
                            if(!jQuery.parseJSON(jQuery('#frmdata').val())[0].length){
                                arraydata.push(jQuery.parseJSON(jQuery('#frmdata').val())[0]);
                            }else{
                                arraydata.push(jQuery.parseJSON(jQuery('#frmdata').val())[0][chkArray]);
                            }
                        }else if(chkArraySize > 1){
                            arraydata.push(jQuery.parseJSON(jQuery('#frmdata').val())[0][chkArray[i]]);
                        }

                    }

                   console.log(arraydata);
                    // alert("frmData" + jQuery('#frmdata').val());
                    arraydata.forEach((val,ind,arr)=>{

                        // alert("price with dollar sign " + val.price);
                         if (val.price) {
                        val.price = val.price.replace('&#8360;', '');
                        val.price = val.price.replace('&#36; ', '');
                        val.price = val.price.replace('&#8360;', '');
                        val.price = val.price.replace('&#36; ', '');
                    }
                        // alert("price without dollar sign " + val.price )
                        // val.price = val.price.replace('&#36;', '');
                       
                    })


                    var ajaxurl = "<?php echo admin_url( 'admin-ajax.php'); ?>";
                    jQuery.ajax({
                        url : ajaxurl,
                        type : 'post',
                        data : {
                            action : 'post_data',
                            data :arraydata,
                            ptype:type,
                        },
                        success : function( response ) {
                            alert(response);
                            
                        }
                    });  
                }
                
                function selectAll(){
                    jQuery("#selectall").click(function(){
                        jQuery('input:checkbox').prop('checked', this.checked);
                    });
                }
                function get_data(link,dtype) {
                    jQuery('#spinner').show();
                    var postContent=jQuery('.content_id').val();
                    var postTitle=jQuery('.title_id').val();
                    var postImage=jQuery('.image_id').val();

                
                    var ajaxurl = "<?php echo admin_url( 'admin-ajax.php'); ?>";
                    jQuery.ajax({
                        url : ajaxurl,
                        type : 'post',
                        data : {
                            action : 'scrape_data',
                            link :link,
                            dtype: dtype,
                            postContent:postContent,
                            postTitle:postTitle,
                            postImage:postImage
                        },
                        success : function( response ) {
                             console.log("response" + response);
                            // alert("parseJson " + jQuery.parseJSON(response));

                         
                             var vae = jQuery.parseJSON(response);
                           
                           // alert(jQuery.parseJSON(response));
                            if (undefined == vae[0].content) {
                                vae[0].content = '';
                            }

                            if(vae[1]=='product'){
                                let image = jQuery(vae[0].image)[0]
                                vae[0].image = jQuery(image).attr('data-src')
                            }

                            if(vae[1]=='shop'){
                               vae[0].forEach((val2,ind2,arr2)=>{
                                let image = jQuery(val2.image)[0]
                                val2.image = jQuery(image).attr('data-src')
                               }) 
                            }

                            response = JSON.stringify(vae)

                            //scraped data stored in hidden inputfield frmdata
                            jQuery('#frmdata').val(response);
                            
                         if (vae[1] == 'product') {
                             htmldata = '<table><tr><th width="30px"><input id="selectall" onclick="selectAll();" class="checkbox checkbox-primary styled" type="checkbox"></th><th width="20%">Name</th><th>Price</th><th style="width: 50%;">Content</th><th>Image</th></tr>';
                             htmldata += '<tr><td><input id="0" value="0" class="chk checkbox checkbox-primary styled" type="checkbox"></td><td><p>' + vae[0].title + '</p></td><td><p>' + vae[0].price + '</p></td><td><p>'+vae[0].short_description+ vae[0].content + '</p></td><td><img id="pimage" width="100px" height="100px" src="' + vae[0].image + '" class="img-rounded"></td></tr></table>';
                             jQuery('#data').html(htmldata);
                         }

                            else if(vae[1] =='shop'){
                                htmldata='<table><tr><th width="30px"><input id="selectall" onclick="selectAll();" class="checkbox checkbox-primary styled" type="checkbox" ></th><th>Name</th><th>Price</th><th style="width: 63%;">Content</th><th>Image</th></tr>';
                                var size=vae[0].length;
                                for(var i=0;i<size;i++){

                                    if (undefined == vae[0][i].content) {
                                        vae[0][i].content = '';
                                    }
                                 htmldata += '<tr><td><input id="'+i+'" value="'+i+'" class="chk checkbox checkbox-primary styled" type="checkbox"></td><td><p>'+vae[0][i].title+'</p></td><td><p >'+vae[0][i].price+'</p></td><td><p >'+vae[0][i].content+'</p></td><td style="padding-bottom: 10px;"><img id="pimage" width="100px" height="100px"src="'+vae[0][i].image+'" class="img-rounded"></td></tr>';   
                                }
                                jQuery('#data').html(htmldata+'</table>');
                            }
                            else if (vae[1] == 'post') {
                                htmldata = '<table><tr><th width="30px"><input id="selectall" onclick="selectAll();" class="checkbox checkbox-primary styled" type="checkbox"></th><th>Title</th><th style="width: 63%;">Content</th><th>Image</th></tr>';
                                htmldata += '<tr><td><input id="0" value="0"class="chk checkbox checkbox-primary styled" type="checkbox"></td><td><p>' + vae[0].title + '</p></td><td>';

                                // Iterate through the content array and format it
                                for (var i = 0; i < vae[0].content.length; i++) {
                                    htmldata += '<p>' + vae[0].content[i].tag + ': ' + vae[0].content[i].content + '</p>';
                                }

                                htmldata += '</td><td><img id="pimage" width="100px" height="100px" src="' + vae[0].image + '" class="img-rounded"></td></tr></table>';
                                jQuery('#data').html(htmldata);
                            }

                            // console.log(jQuery.parseJSON(vae[0].variation));
                            jQuery('#container').show();
                            jQuery('#spinner').hide();

                        },
                        error:function(err) {
                            console.log(err)
                            jQuery('#spinner').hide();
                            alert('couldnt scrape the page')
                        }
                    });

                }
          
                jQuery(document).ready(function ($) {
                    $('#checkClasses').hide();
                    $('#postPageContent').hide(); // Initially hide postPageContent

                });
                jQuery('#checkBoxClasses').change(function() {
                    if(jQuery('#checkBoxClasses').prop('checked')) { 
                        jQuery('#postPageContent').show();
                    } else {
                        jQuery('#postPageContent').hide();
                    }
                })
                    
                
                function changePageType(val) {
                    if ('post' == val){
                        jQuery('#checkClasses').show();
                    } else {
                        jQuery('#checkClasses').hide();
                        jQuery('#postPageContent').hide();
                    }
                }


            </script>
            <style type="text/css">
                .bootstrap-iso td,
                .bootstrap-iso th {
                   padding: 10px !important; 
                }
                .bootstrap-iso .container {
                    margin-right: auto;
                    margin-left: auto;
                    padding-left: 76px !important;
                    padding-right: 0px !important; 
                }
            </style>
            <?php
        }
        
    
    }
    new Extendons_Wp_Scrapper_admin();