<?php
require_once('../libinc/user.php');

if (!isset($_REQUEST['action'])) die("Your kung-fu is no good here");

$usr = new User();
switch ($_REQUEST['action']){
	case 'login': echo $usr->login($_REQUEST['user'], $_REQUEST['pass'], isset($_REQUEST['direct']), isset($_REQUEST['referer'])?$_REQUEST['referer']:null); break;
	case 'register': echo $usr->register($_REQUEST['user'], $_REQUEST['pass'], $_REQUEST['email'], $_REQUEST['first'], $_REQUEST['last'], isset($_REQUEST['direct'])); break;
	case 'check': echo $usr->check($_REQUEST['user']); break; // Make sure a username doesn't already exist
	case 'forgot': echo $usr->forgot(isset($_REQUEST['direct'])); break; // Process a forgotten password
	case 'logout': echo $usr->logout(isset($_REQUEST['direct']), isset($_REQUEST['referer'])?$_REQUEST['referer']:null); break; // Logout a user
	case 'checkLogged': echo $usr->checkLogged(); break; // Verify a logged in and permissable user
	
	default : echo "Your kung-fu is no good here";
}
