<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$method=$_SERVER['REQUEST_METHOD']??'GET';
$path=parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH);
$path=preg_replace('~^/elecciones/api/?~','/',$path);
$path='/'.trim($path,'/');
$root=dirname(__DIR__);
$dataDir=$root.'/data';
if(!is_dir($dataDir)) mkdir($dataDir,0750,true);
if(!file_exists($dataDir.'/.htaccess')) file_put_contents($dataDir.'/.htaccess',"Require all denied\n");
$dbPath=$dataDir.'/database.json';
function out($data,$status=200){http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
function body(){return json_decode(file_get_contents('php://input'),true)??[];}
function slug($s){$s=iconv('UTF-8','ASCII//TRANSLIT//IGNORE',(string)$s);return trim(preg_replace('/-+/','-',preg_replace('/[^a-z0-9-]/','-',strtolower($s))),'-');}
function publicUrl($s){return 'https://lavdigitalagency.com/elecciones/'.rawurlencode($s).'/';}
function readDb(){global $dbPath;$db=file_exists($dbPath)?json_decode(file_get_contents($dbPath),true):null;return is_array($db)?array_replace(['projects'=>[],'customTemplates'=>[],'citizenInquiries'=>[],'analyticsEvents'=>[]],$db):['projects'=>[],'customTemplates'=>[],'citizenInquiries'=>[],'analyticsEvents'=>[]];}
function saveDb($db){global $dbPath;$fp=fopen($dbPath.'.lock','c');if(!$fp||!flock($fp,LOCK_EX))out(['success'=>false,'message'=>'No se pudo bloquear base de datos'],500);$tmp=$dbPath.'.'.bin2hex(random_bytes(4)).'.tmp';file_put_contents($tmp,json_encode($db,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));rename($tmp,$dbPath);flock($fp,LOCK_UN);fclose($fp);}
function findIndex($projects,$id){foreach($projects as $i=>$p)if(($p['id']??'')===$id)return $i;return -1;}
function reserved($s){return in_array($s,['api','admin','elecciones','assets','dashboard','public','login','register','settings','index','favicon','robots','sitemap'],true);}
function uniqueSlug($db,$s,$except=''){foreach($db['projects'] as $p)if(($p['slug']??'')===$s&&($p['id']??'')!==$except)return false;return !reserved($s);}
$db=readDb();
if($path==='/projects'&&$method==='GET'){$items=$db['projects'];foreach(['status','category','partyId'] as $k)if(isset($_GET[$k])&&$_GET[$k]!=='todos')$items=array_values(array_filter($items,fn($p)=>($p[$k]??'')===$_GET[$k]));if(!empty($_GET['search'])){$q=mb_strtolower($_GET['search']);$items=array_values(array_filter($items,fn($p)=>str_contains(mb_strtolower(json_encode($p,JSON_UNESCAPED_UNICODE)),$q)));}out(['success'=>true,'count'=>count($items),'projects'=>$items]);}
if($path==='/projects/check-slug'&&$method==='GET'){$s=slug($_GET['slug']??'');$ok=strlen($s)>=3&&uniqueSlug($db,$s,$_GET['currentId']??'');out(['valid'=>$ok,'slug'=>$s,'url'=>$ok?publicUrl($s):null,'message'=>$ok?'Dirección disponible':'Dirección no disponible']);}
if($path==='/projects'&&$method==='POST'){$p=body();if(empty($p['internalName'])||empty($p['candidate']['fullName']))out(['success'=>false,'message'=>'Nombre interno y candidato requeridos'],400);$s=slug($p['slug']??$p['candidate']['shortName']??$p['internalName']);if(strlen($s)<3)$s='proyecto-'.time();$base=$s;$n=1;while(!uniqueSlug($db,$s))$s=$base.'-'.$n++;$p['id']=$p['id']??uniqid('proj-',true);$p['slug']=$s;$p['previousSlugs']=[];$p['status']=$p['status']??'borrador';$p['meta']=array_replace(['createdAt'=>gmdate('c'),'updatedAt'=>gmdate('c'),'viewsCount'=>0,'clicksCount'=>0,'qrScansCount'=>0,'inquiriesCount'=>0],$p['meta']??[]);$db['projects'][]=$p;saveDb($db);out(['success'=>true,'project'=>$p],201);}
if(preg_match('~^/projects/by-slug/([^/]+)$~',$path,$m)&&$method==='GET'){$s=slug($m[1]);foreach($db['projects'] as $p)if(($p['slug']??'')===$s||in_array($s,$p['previousSlugs']??[],true))out(['success'=>true,'project'=>$p,'isRedirect'=>$p['slug']!==$s,'currentSlug'=>$p['slug']]);out(['success'=>false,'message'=>'No encontrada'],404);}
if(preg_match('~^/projects/([^/]+)(?:/(duplicate|publish|unpublish))?$~',$path,$m)){$id=$m[1];$op=$m[2]??'';$i=findIndex($db['projects'],$id);if($i<0)out(['success'=>false,'message'=>'Proyecto no encontrado'],404);$p=$db['projects'][$i];
 if($op==='duplicate'&&$method==='POST'){$p['id']=uniqid('proj-',true);$p['internalName']='Copia de '.($p['internalName']??'Proyecto');$p['slug']=slug($p['slug'].'-copia-'.time());$p['status']='borrador';$p['previousSlugs']=[];$p['meta']=['createdAt'=>gmdate('c'),'updatedAt'=>gmdate('c'),'viewsCount'=>0,'clicksCount'=>0,'qrScansCount'=>0,'inquiriesCount'=>0];array_unshift($db['projects'],$p);saveDb($db);out(['success'=>true,'project'=>$p]);}
 if($op==='publish'&&$method==='POST'){$b=body();$s=slug($b['slug']??$p['slug']);if(!uniqueSlug($db,$s,$id))out(['success'=>false,'message'=>'Dirección ocupada'],400);$p['slug']=$s;$p['status']='publicado';$p['meta']['demo']=!empty($b['demo']);$p['meta']['publishedAt']=gmdate('c');$p['meta']['publishedUrl']=publicUrl($s);$p['meta']['updatedAt']=gmdate('c');$db['projects'][$i]=$p;saveDb($db);out(['success'=>true,'project'=>$p]);}
 if($op==='unpublish'&&$method==='POST'){$p['status']='borrador';$p['meta']['updatedAt']=gmdate('c');$db['projects'][$i]=$p;saveDb($db);out(['success'=>true,'project'=>$p]);}
 if($op===''&&$method==='GET')out(['success'=>true,'project'=>$p]);
 if($op===''&&$method==='DELETE'){array_splice($db['projects'],$i,1);saveDb($db);out(['success'=>true,'message'=>'Proyecto eliminado']);}
 if($op===''&&$method==='PUT'){$b=body();if(isset($b['slug'])&&$b['slug']!==$p['slug']){$s=slug($b['slug']);if(!uniqueSlug($db,$s,$id))out(['success'=>false,'message'=>'Dirección ocupada'],400);$p['previousSlugs'][]=$p['slug'];$b['slug']=$s;}$p=array_replace_recursive($p,$b);$p['id']=$id;$p['meta']['updatedAt']=gmdate('c');$db['projects'][$i]=$p;saveDb($db);out(['success'=>true,'project'=>$p]);}
}
if($path==='/citizen-inquiries'&&$method==='GET'){$items=$db['citizenInquiries'];foreach(['projectId','status'] as $k)if(!empty($_GET[$k])&&$_GET[$k]!=='todos')$items=array_values(array_filter($items,fn($p)=>($p[$k]??'')===$_GET[$k]));out(['success'=>true,'count'=>count($items),'inquiries'=>$items]);}
if($path==='/citizen-inquiries'&&$method==='POST'){$b=body();if(empty($b['citizenName'])||empty($b['message'])||empty($b['privacyAccepted']))out(['success'=>false,'message'=>'Datos requeridos'],400);$b['id']=uniqid('inq-');$b['folio']='LAV-'.date('Y').'-'.random_int(1000,9999);$b['status']='nuevo';$b['createdAt']=gmdate('c');array_unshift($db['citizenInquiries'],$b);saveDb($db);out(['success'=>true,'folio'=>$b['folio'],'inquiry'=>$b],201);}
if(preg_match('~^/citizen-inquiries/([^/]+)$~',$path,$m)&&$method==='PATCH'){$b=body();foreach($db['citizenInquiries'] as &$item)if($item['id']===$m[1]){$item=array_replace($item,array_intersect_key($b,array_flip(['status','notes'])));$updated=$item;unset($item);saveDb($db);out(['success'=>true,'inquiry'=>$updated]);}out(['success'=>false],404);}
if($path==='/templates'&&$method==='GET')out(['success'=>true,'templates'=>$db['customTemplates']]);
if($path==='/templates'&&$method==='POST'){$t=body();$t['id']=uniqid('tpl-');$db['customTemplates'][]=$t;saveDb($db);out(['success'=>true,'template'=>$t],201);}
if($path==='/analytics/event'&&$method==='POST'){$b=body();foreach($db['projects'] as &$p)if(($p['id']??'')===($b['projectId']??'')){$k=['click'=>'clicksCount','view'=>'viewsCount','qr_scan'=>'qrScansCount'][$b['eventType']??'']??null;if($k)$p['meta'][$k]=($p['meta'][$k]??0)+1;break;}unset($p);$db['analyticsEvents'][]=array_merge($b,['id'=>uniqid('ev-'),'timestamp'=>gmdate('c')]);$db['analyticsEvents']=array_slice($db['analyticsEvents'],-5000);saveDb($db);out(['success'=>true]);}
if($path==='/analytics'&&$method==='GET'){$p=$db['projects'];$sum=fn($k)=>array_sum(array_map(fn($x)=>$x['meta'][$k]??0,$p));out(['success'=>true,'summary'=>['totalProjects'=>count($p),'publishedProjects'=>count(array_filter($p,fn($x)=>($x['status']??'')==='publicado')),'draftProjects'=>count(array_filter($p,fn($x)=>($x['status']??'')==='borrador')),'totalViews'=>$sum('viewsCount'),'totalClicks'=>$sum('clicksCount'),'totalQrScans'=>$sum('qrScansCount'),'totalInquiries'=>count($db['citizenInquiries']),'recentInquiries'=>array_slice($db['citizenInquiries'],0,10)]]);}
if($path==='/backup/export'&&$method==='GET'){header('Content-Disposition: attachment; filename="elecciones-backup.json"');out($db);}
if($path==='/backup/restore'&&$method==='POST'){$b=body();if(!isset($b['projects'])||!is_array($b['projects']))out(['success'=>false,'message'=>'Respaldo inválido'],400);$db=array_replace($db,$b);saveDb($db);out(['success'=>true,'message'=>'Restaurado']);}
if($path==='/gemini/assist'&&$method==='POST')out(['success'=>false,'message'=>'Asistente Gemini requiere configurar un backend con credenciales seguras.'],503);
out(['success'=>false,'message'=>'Ruta no encontrada','path'=>$path],404);
