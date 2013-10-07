<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     function.eightball.php
 * Type:     function
 * Name:     eightball
 * Purpose:  outputs a random magic answer
 * -------------------------------------------------------------
 */
function smarty_function_genNav($params, Smarty_Internal_Template $template) {

	// clean URL
	$page = $template->tpl_vars['cPage'];

	// Pull data as desired
	$PDO = new myPDO();
	if ( strrchr($page, '/index') == '/index' ) {
		$STH = $PDO->prepare("SELECT * FROM web_vfs WHERE (parentID = ? OR vfsID = ?) AND visible = 'yes' ORDER BY title;"); // find children
	} else {
		$STH = $PDO->prepare("SELECT * FROM web_vfs WHERE (parentID = (SELECT parentID FROM web_vfs WHERE vfsID = ?) OR vfsID = (SELECT parentID FROM web_vfs WHERE vfsID = ?)) AND visible = 'yes' ORDER BY title;"); // find parents
	}
	$STH->execute( $template->tpl_vars['vfsID'], $template->tpl_vars['vfsID'] );

	// Build html nav
	$strHTML = '<ul>';
	while ( $row = $STH->fetch( PDO::FETCH_ASSOC ) ){
		$path = $row['path'] . $template->tpl_vars['extension'];
		if ($page == $row['path']) {
			$strHTML .= '<li class="active"><a href="' . $path . '">' . $row['title'] . '</a></li>';
		} else {
			$strHTML .= '<li><a href="' . $path . '">' . $row['title'] . '</a></li>';
		}
	}
	return $strHTML . '</ul>';
}
