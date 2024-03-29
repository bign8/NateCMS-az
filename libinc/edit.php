<?php
include("site_inc.php");

class Edit {
	// WARNING: Changing this will mess up the webConHistory table
	public static $NUM_OF_HISTORY = 5; // move to config
	private $db;

	function __construct() {
		$this->db = new myPDO();
	}

	function updateContent($cid, $content) {
		$insSTH = $this->db->prepare("UPDATE `web_content` SET `content` = ? WHERE `contentID` = ? LIMIT 1 ;"); // insert content into database
		$insSTH->execute( $content, $cid );
		if ($this->db->errorCode()!=0) return 'noCheck';
		
		// log content into db's cyclic queue - still in development
		$histSTH = $this->db->prepare("INSERT INTO `webConHistory` (`count`,`mod`,`contentID`,`content`) (SELECT ( coalesce(max(`count`), -1) + 1), (( coalesce(max(`count`), -1) + 1) % ?), ?, ? FROM `webConHistory` WHERE `contentID` = ?) ON DUPLICATE KEY UPDATE count = values(`count`), content = values(`content`);");
		$histSTH->execute( self::$NUM_OF_HISTORY, $cid, $content, $cid );
		
		return ($this->db->errorCode()==0)?'check':'noCheck';
	}

	function addContent($vfsid, $dest, $blockID) {
		$error = json_encode(array('check' => 'noCheck', 'html' => ''));
		
		// start select on input data
		$selSTH = $this->db->prepare("SELECT v.`orders`+1 AS nextOrder, v.`locID`, b.`editer`, b.`initContent` FROM `web_v_content` as v, `web_block` as b WHERE v.`locName`=? AND v.`vfsID`=? AND b.`blockID`=? ORDER BY v.`orders` DESC LIMIT 1;");
		$selSTH->execute( $dest, $vfsid, $blockID );

		if ($selSTH->rowCount() == 0 ) { // new query here that pulls same info, but with orders = 1 - TODO: optimize (hint-ish, we already have all the data, no need for a return db trip)
			$firstSTH = $this->db->prepare("SELECT 1 AS nextOrder, l.`locID`, b.`editer`, b.`initContent` FROM `web_locations` as l, `web_block` as b WHERE l.`locName`=? AND b.`blockID`=? LIMIT 1;");
			$firstSTH->execute( $dest, $blockID );
			$toVal = $firstSTH->fetch( PDO::FETCH_ASSOC );
		} else {
			$toVal = $selSTH->fetch( PDO::FETCH_ASSOC );
		}
		if ($this->db->errorCode()!=0) return $error;
		
		// insert data to database
		$insSTH = $this->db->prepare("INSERT INTO `web_content` (`vfsID`,`blockID`,`content`,`orders`,`locID`) VALUES (?, ?, ?, ?, ?);");
		$insSTH->execute( $vfsid, $blockID, $toVal['initContent'], $toVal['nextOrder'], $toVal['locID'] );
		
		$item = $this->db->query("SELECT * FROM `web_v_content` WHERE `contentID` = last_insert_id()")->fetch( PDO::FETCH_ASSOC );
		if ($this->db->errorCode()!=0) return $error;
		
		// TODO: db selection for scripts that arent already on curret page
		
		// compile editer template
		$smarty = new SmartyConfig();
		$tpl = $smarty->createTemplate($toVal['editer']);
		$tpl->assign('item', $item);
		
		return json_encode(array('check' => 'check', 'html' => $tpl->fetch())); // might have to convert to json, loading scripts for different editers
	}
	
	function updateOrder($data) {
		$locSTH = $this->db->prepare("SELECT locID FROM `web_locations` WHERE `locName`=?;");
		$updSTH = $this->db->prepare("UPDATE `web_content` SET `orders` = ?, `locID` = ? WHERE `contentID` = ? LIMIT 1 ;");

		foreach ($data as $value) { // TODO: move to single query!
			$locSTH->execute( $value['dest'] );
			$loc = $locSTH->fetch( PDO::FETCH_ASSOC );
			
			$updSTH->execute( $value['ord'], $loc['locID'], $value['id'] );
		}
		
		return ($this->db->errorCode()==0)?'check':'noCheck';
	}
	
	function removeContent($remID) {
		$this->db->prepare("DELETE FROM `web_content` WHERE `contentID`= ? LIMIT 1;")->execute( $remID );
		
		if ($this->db->errorCode()!=0) return 'noCheck';
		
		// the following will be replaced with on delete cascate table relation - TODO: need to only set the state as deleted
		$this->db->prepare("DELETE FROM `webConHistory` WHERE `contentID`=? LIMIT ?;")->execute( $remID, self::$NUM_OF_HISTORY );
		
		return ($this->db->errorCode()==0)?'check':'noCheck';
	}
	
	function insertPage($page) {
		// Remove query string
		if ( strpos($page,'?') !== false ) $page = substr( $page, 0, strrpos( $page, "?"));

		if( strrchr($page, "/") == "/" ) { // simplified?
			$page .= 'index'; // add index to each directory
		} else {
			if ( config::Extension != '' ) {
				if ( strrchr($page, config::Extension) == config::Extension ) { // if it ends with extension
					$page = substr( $page, 0, strrpos( $page, config::Extension ) ); // enforce extensions
				}
				
			}
		}

		// FIND ACTUAL PARENT

		$this->db->prepare("INSERT INTO `web_vfs` (`parentID`, `templateID`, `path`, `short`, `title`, `keywords`, `description`, `visible`, `secure`) VALUES (?, '1', ?, NULL, 'Blank', 'Blank,Blank,Blank', 'Blank', 'yes', 'no');")->execute( 1, $page );


		return ($this->db->errorCode()==0)?'check':'noCheck';
	}
}
