<?php
include("../libinc/edit.php");

if (User::verify() == '') die("Your Kung-Fu is not strong!"); // ensure authenticated
// now ensure rights to edit
if (!isset($_REQUEST['action'])) die("Your kung-fu is no good here");

$edt = new Edit();
switch ($_REQUEST['action']) {
	case 'updateOrder':
		echo $edt->updateOrder($_REQUEST['data']);
		break;
	case 'removeContent':
		echo $edt->removeContent($_REQUEST['remID']);
		break;
	case 'addContent':
		echo $edt->addContent($_REQUEST['vfsID'], $_REQUEST['loc'], $_REQUEST['blockID']);
		break;
	case 'updateContent':
		echo $edt->updateContent($_REQUEST['cID'], $_REQUEST['content']);
		break;
	
	default:
		echo "Your Kung-Fu is not strong!";
}
