<?php 
/**
 * bodycapture.php -- Captures the body of any page inside Catalyst.  To run, call it like so:
 * 			
 * 			php bodycapture.php username=admin1 password=123123 site=nsg env=qa7 path=admin/home
 * 
 * The params are as follows:
 * 
 * 	-- username - the username you're logging in with
 *  -- password - the username you're logging in with
 *  -- site - this site name used to refer to the LRN partner site
 *  -- path - the URL on the site after https://{site}-console{.env}.lrn.com
 *  -- env - the environment to get from (e.g. dev3, qa7)
 * 
 */
require_once 'html5lib-php-master/library/HTML5/Parser.php';
		
parse_str(implode('&', array_slice($argv, 1)), $_GET);

$isqa = isset($_GET['env']) ? '.'.$_GET['env'] : '';
$url = 'https://'.$_GET['site'].'-console'.$isqa.'.lrn.com/';
$postdata = "username=".$_GET['username']."&password=".$_GET['password']."&submitx=";

$cookie = "./cookie_".$_GET['site'].".txt";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url."auth/login");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6");
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie); 
curl_setopt($ch, CURLOPT_REFERER, $url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
curl_setopt($ch, CURLOPT_POST, 1);
curl_exec($ch);

$url .= $_GET['path'];
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6");
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie); 
curl_setopt($ch, CURLOPT_REFERER, $url);
curl_setopt($ch, CURLOPT_POST, false);
$data = curl_exec($ch);
curl_close($ch);

$data1 = str_replace(chr(39),"\'",$data);
$dom = HTML5_Parser::parse($data1);
$body = $dom->getElementsByTagName('body')->item(0);
$newdoc = new DOMDocument();
$newdoc->appendChild($newdoc->importNode($body,TRUE));

$lines = explode("\r\n",$newdoc->saveHTML());
if(count($lines) < 2)
	$lines = explode("\n",$newdoc->saveHTML());
$bstr = str_replace("\"","\\\"",implode("\\\r\n",$lines));
$js = "var ".str_replace('/','_',$_GET['path'])."_fixture = $(\"".$bstr. "\");";
file_put_contents(str_replace('/','_',$_GET['path']).".js", $js);
print "Complete!\r\n\r\n";

?>