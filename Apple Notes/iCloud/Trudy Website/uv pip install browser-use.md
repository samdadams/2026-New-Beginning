# 1) wp_cli_autopilot_commands.txt (paste these blocks in WP-CLI terminal)

# ====== WP-CLI AUTOPILOT (NO SSH) ======
# Run these inside your WordPress Toolkit terminal at the site root.
# 0) First, in cPanel File Manager, upload site_map.json to your WP root (same folder as wp-config.php).

# 1) Theme + core plugins + basics
wp theme install hello-elementor --activate
wp plugin install elementor wordpress-seo updraftplus wp-fastest-cache contact-form-7 header-footer-elementor --activate
wp option update timezone_string "Asia/Makassar"
wp rewrite structure '/%postname%/' --hard
wp rewrite flush --hard

# 2) Create the Auto Builder plugin (writes a small plugin file from WP-CLI)
wp eval '
$dir=WP_PLUGIN_DIR."/auto-builder"; if(!is_dir($dir)) wp_mkdir_p($dir);
$code = <<'"'"'PHP'"'"'
<?php
/*
Plugin Name: Auto Builder (Elementor)
*/
if (!defined("ABSPATH")) exit;
function ab_elementor_section_json($title,$text){
  return wp_json_encode([[
    "id"=>"sec_".wp_generate_password(5,false),
    "elType"=>"section",
    "elements"=>[[
      "id"=>"col_".wp_generate_password(5,false),
      "elType"=>"column",
      "elements"=>[
        ["id"=>"h_".wp_generate_password(5,false),"elType"=>"widget","widgetType"=>"heading","settings"=>["title"=>$title]],
        ["id"=>"t_".wp_generate_password(5,false),"elType"=>"widget","widgetType"=>"text-editor","settings"=>["editor"=>$text]]
      ]
    ]]
  ]]);
}
function ab_build_from_config_path($path){
  if(!file_exists($path)){ echo "Missing config: $path\n"; return; }
  $cfg=json_decode(file_get_contents($path), true);
  if(!is_array($cfg)){ echo "Bad JSON in $path\n"; return; }
  $ids=[];
  foreach($cfg["pages"] as $p){
    $slug=sanitize_title($p["slug"]);
    $page=get_page_by_path($slug);
    $id=$page?$page->ID:wp_insert_post(["post_title"=>$p["title"],"post_name"=>$slug,"post_type"=>"page","post_status"=>"publish"]);
    update_post_meta($id,"_elementor_edit_mode","builder");
    update_post_meta($id,"_elementor_data",ab_elementor_section_json($p["hero"]["title"],$p["hero"]["text"]));
    $ids[$slug]=$id;
  }
  if(isset($cfg["front_page_slug"],$ids[$cfg["front_page_slug"]])){
    update_option("show_on_front","page");
    update_option("page_on_front",$ids[$cfg["front_page_slug"]]);
  }
  $menu_id=wp_create_nav_menu("Main Menu");
  foreach($cfg["menu"]["items"] as $slug){
    if(isset($ids[$slug])) wp_update_nav_menu_item($menu_id,0,[
      "menu-item-object-id"=>$ids[$slug],
      "menu-item-object"=>"page",
      "menu-item-type"=>"post_type",
      "menu-item-status"=>"publish"
    ]);
  }
  $locs=get_theme_mod("nav_menu_locations"); if(!is_array($locs)) $locs=[];
  $locs["primary"]=$menu_id; set_theme_mod("nav_menu_locations",$locs);
  update_option("permalink_structure","/%postname%/"); flush_rewrite_rules();
  echo "Build complete\n";
}
PHP
;
file_put_contents($dir."/auto-builder.php",$code);
echo "Plugin written to $dir/auto-builder.php\n";
'

# 3) Activate the Auto Builder plugin
wp plugin activate auto-builder

# 4) Build pages + menus from your uploaded site_map.json
# (Make sure you uploaded site_map.json to your WordPress root first)
wp eval 'ab_build_from_config_path(ABSPATH."site_map.json"); echo "OK\n";'

# 5) Verify pages exist
wp post list --post_type=page --fields=ID,post_title,post_name,post_status --format=table