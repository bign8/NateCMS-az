<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{$title}</title>
  <meta name="description" content="{$desc}">
  <meta name="keywords" content="{$keywords}">
  <meta name="author" content="Nate Woods">

  <link rel="stylesheet" type="text/css" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/themes/ui-lightness/jquery-ui.css" />
  <link rel="stylesheet" type="text/css" href="/css/Default.css" />
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
  <!-- // <script src="/js/jquery.cookie.js"></script> -->
  <script src="/js/jquery.validate.min.js" ></script>
  <script src="/js/all.js" ></script>
  <link rel="stylesheet" type="text/css" href="/dynamic/blank/css.css" id="toSwitch" />

  {if isset($smarty.get.mode) && $smarty.get.mode == 'edit'}<script src="/js/EditAll.js" ></script>{/if}
  
  {include file="genHeader.tpl"}
</head>
<body>
  <div id="wrapper">
    <header>
      <hgroup>
        <h1><a href="/">Nate Stats Dev Server</a></h1>
        <h2>See the <a href="https://github.com/bign8/NateCMS">repo</a> for more informaiton.</h2>
      </hgroup>
    </header>
    <div id="body">