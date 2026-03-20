<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'local' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          '-R?@lEli2$sXL!`bBprq2hi&8cVWMLKJdl<^M9.s$Zq+@958_+uYM=ZxIgco2|s5' );
define( 'SECURE_AUTH_KEY',   'LDZ<ZE&mpeI@>$XY1!1_eoQXF*{w mu+-U1<(K$7p>&yui/(DuYwr!-SfWJyCi-N' );
define( 'LOGGED_IN_KEY',     'p8/QH>VPc8iHH6]q3Vw8=h?M?DPH|=R0Us{;bqfLA4wFjWTBk&S[IR?[S~{@hTF?' );
define( 'NONCE_KEY',         'sWr}Vr39Vy3m$c3qaA=6%n43 fX .72BM`)mOYb4Jl94n.nYRte;=(=SfUt}5M3I' );
define( 'AUTH_SALT',         'H:Q3z+}@CzaIIs^gC(F,T3!B;8Pz )}e=_Y(hoVoU!sHKBuQZ!.?6p@;lmP=G,B]' );
define( 'SECURE_AUTH_SALT',  'qhnTWYJWp$Cv/iG>{X+KdP9d8o7S 08y~b&/5`*Gpl:ntD0qx~jKZ?.wIj#kCOM+' );
define( 'LOGGED_IN_SALT',    '3H:gCot`bAROvAE},oB$6>1u@pyTEs/cf{k_$%;&@o!dkF<nBhG/|QOsus}t%^w8' );
define( 'NONCE_SALT',        'WE8@yX}!l]}Tv%-3{O^XW4]WBI~!DmD*cPg:7$]%FwYy6bUcGQ-T2bo<j^wL%|v1' );
define( 'WP_CACHE_KEY_SALT', '!(Muf9Fwyh=S;nd%6#wMzt^TV.,Pd|ZYnbQ~/IofDDQVs[7*bg&TjtedsY2@)h[r' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'WP_ENVIRONMENT_TYPE', 'local' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
