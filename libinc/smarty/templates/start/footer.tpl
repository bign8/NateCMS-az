		</div> {* body *}
		<footer>
			Produced by NW PRODUCTIONS, CMS AND ALL
		</footer>
	</div> {* wrapper *}
	<div id="editorNav">
		<ul>
		{if $isEditer}
			{if !isset($smarty.get.mode) || $smarty.get.mode != 'edit'}
				<li><a href="{$page}?mode=edit" class="ui-icon ui-icon-pencil" title="Edit Page">Edit</a></li>
			{else}
				<li id="orderDisable" style="display:none"><a href="#shuffle!" class="ui-icon ui-icon-check" title="Save Re-order" onclick="return Editor.orderDisable();">Save Re-order</a></li>
				<li id="orderEnable"><a href="#shuffle!" class="ui-icon ui-icon-shuffle" title="Re-order Content" onclick="return Editor.orderEnable();">Re-order Content</a></li>
				<li><a href="{$page}" class="ui-icon ui-icon-circle-close" title="Close Editor">Close</a></li>
			{/if}
			<li><a href="/user.php?action=forceLogout" onclick="return General.logout()" class="ui-icon ui-icon-power" title="Logout of Editor">Logout</a></li>
		{else}
			<li><a href="/user.php?action=forceLogin" onclick="return General.login()" class="ui-icon ui-icon-key" title="Login to Editor">Login</a></li>
		{/if}
		{if isset($smarty.get.mode) && $smarty.get.mode == 'edit' && $is404}
			<li><a href="/newPage" onclick="return Editor.makePage();" class="ui-icon ui-icon-document" title="Make this a page">Create page</a></li>{* only show if correct extension *}
		{/if}
		</ul>
	</div>
</body>
</html>
{*$smarty.server|@print_r*}