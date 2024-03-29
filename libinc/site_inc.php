<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

if ( !defined('__DIR__') ) { define('__DIR__', dirname(__FILE__)); } // php < 5.3.0 fix

if ( file_exists( __DIR__ . '\config.php' ) ) {
	require_once( __DIR__ . '\config.php' );
} else {
	die( 'Please rename "config_blank.php" to "config.php" and configure the appropriate variables<br/>This would be a good place for an install script' );
}
	
require_once( __DIR__ . '\db.php' );
require_once( __DIR__ . '\smarty\SmartyConfig.php' );
require_once( __DIR__ . '\page.php' );
require_once( __DIR__ . '\user.php' );
