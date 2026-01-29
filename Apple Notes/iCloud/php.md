/**
 * Child-Theme functions and definitions
 */

// WooCommerce Checkout Field Customization - Remove Address Fields
add_filter('woocommerce_checkout_fields', function($fields) {
    // Remove ALL billing address fields completely
    unset($fields['billing']['billing_address_1']);
    unset($fields['billing']['billing_address_2']);
    unset($fields['billing']['billing_city']);
    unset($fields['billing']['billing_postcode']);
    unset($fields['billing']['billing_country']);
    unset($fields['billing']['billing_state']);
    
    // Make sure billing is still required but only for name and email
    $fields['billing']['billing_first_name']['required'] = true;
    $fields['billing']['billing_last_name']['required'] = true;
    $fields['billing']['billing_email']['required'] = true;
    
    // Remove shipping fields completely
    unset($fields['shipping']);
    
    return $fields;
});