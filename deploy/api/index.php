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

function authDbPath(){global $dataDir;return $dataDir.'/users.json';}
function readUsers(){
 $file=authDbPath();
 if(!is_file($file)){
  $initial=['users'=>[['id'=>'admin-lavariega','username'=>'lavariega','passwordHash'=>'$2y$12$a4gUwBW2SkaV7KZBOnlJke4xmI649nIhQujrRg1LDURJMjylFbPMC','role'=>'superadmin','active'=>true]]];
  $fp=fopen($file,'x');if($fp){fwrite($fp,json_encode($initial));fclose($fp);chmod($file,0600);}
 }
 $db=json_decode(@file_get_contents($file),true);
 return is_array($db)?$db:['users'=>[]];
}
function saveUsers($db){$file=authDbPath();$temp=$file.'.'.bin2hex(random_bytes(5)).'.tmp';file_put_contents($temp,json_encode($db));chmod($temp,0600);rename($temp,$file);}
function startAuthSession(){
 if(session_status()!==PHP_SESSION_ACTIVE){
  session_name('LAVELECTIONSSID');
  session_set_cookie_params(['lifetime'=>0,'path'=>'/elecciones/','secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Lax']);
  ini_set('session.use_strict_mode','1');
  session_start();
 }
}
function currentUser(){
 startAuthSession();$id=$_SESSION['user_id']??null;if(!$id)return null;
 foreach(readUsers()['users'] as $u)if($u['id']===$id&&!empty($u['active']))return ['id'=>$u['id'],'username'=>$u['username'],'role'=>$u['role']];
 return null;
}
function requireUser($admin=false){$u=currentUser();if(!$u)out(['success'=>false,'message'=>'Inicia sesión'],401);if($admin&&$u['role']!=='superadmin')out(['success'=>false,'message'=>'Solo el administrador universal puede gestionar usuarios'],403);return $u;}
function csrfCheck(){startAuthSession();$token=$_SERVER['HTTP_X_CSRF_TOKEN']??'';if(!is_string($token)||!hash_equals($_SESSION['csrf']??'', $token))out(['success'=>false,'message'=>'Sesión inválida. Actualiza la página.'],403);}
if($path==='/auth/login'&&$method==='POST'){
 $b=body();$username=(string)($b['username']??'');$password=(string)($b['password']??'');
 $db=readUsers();$found=null;foreach($db['users'] as $u)if(hash_equals($u['username'],$username)){$found=$u;break;}
 if(!$found||empty($found['active'])||!password_verify($password,$found['passwordHash'])){usleep(300000);out(['success'=>false,'message'=>'Credenciales incorrectas'],401);}
 startAuthSession();session_regenerate_id(true);$_SESSION['user_id']=$found['id'];$_SESSION['csrf']=bin2hex(random_bytes(24));
 out(['success'=>true,'user'=>['id'=>$found['id'],'username'=>$found['username'],'role'=>$found['role']],'csrf'=>$_SESSION['csrf']]);
}
if($path==='/auth/me'&&$method==='GET'){$u=currentUser();if(!$u)out(['success'=>false],401);if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));out(['success'=>true,'user'=>$u,'csrf'=>$_SESSION['csrf']]);}
if($path==='/auth/logout'&&$method==='POST'){requireUser();csrfCheck();$_SESSION=[];session_destroy();out(['success'=>true]);}
if($path==='/users'&&$method==='GET'){requireUser(true);$users=array_map(fn($u)=>['id'=>$u['id'],'username'=>$u['username'],'role'=>$u['role'],'active'=>$u['active']],readUsers()['users']);out(['success'=>true,'users'=>$users]);}
if($path==='/users'&&$method==='POST'){
 requireUser(true);csrfCheck();$b=body();$name=trim((string)($b['username']??''));$pass=(string)($b['password']??'');
 if(!preg_match('/^[a-zA-Z0-9_.-]{3,40}$/',$name)||strlen($pass)<12)out(['success'=>false,'message'=>'Usuario válido y contraseña de mínimo 12 caracteres'],400);
 $db=readUsers();foreach($db['users'] as $u)if(strcasecmp($u['username'],$name)===0)out(['success'=>false,'message'=>'Usuario existente'],409);
 $db['users'][]=['id'=>bin2hex(random_bytes(12)),'username'=>$name,'passwordHash'=>password_hash($pass,PASSWORD_DEFAULT),'role'=>'editor','active'=>true];saveUsers($db);out(['success'=>true]);
}
if(preg_match('~^/users/([a-f0-9]{24})$~',$path,$m)&&$method==='PATCH'){
 requireUser(true);csrfCheck();$b=body();$db=readUsers();
 foreach($db['users'] as &$u)if($u['id']===$m[1]&&$u['role']!=='superadmin'){
  if(isset($b['active']))$u['active']=(bool)$b['active'];
  if(isset($b['password'])){if(strlen((string)$b['password'])<12)out(['success'=>false,'message'=>'Contraseña demasiado corta'],400);$u['passwordHash']=password_hash($b['password'],PASSWORD_DEFAULT);}
  saveUsers($db);out(['success'=>true]);
 }unset($u);out(['success'=>false,'message'=>'Usuario no encontrado o protegido'],404);
}
if(preg_match('~^/users/([a-f0-9]{24})$~',$path,$m)&&$method==='DELETE'){
 requireUser(true);csrfCheck();$db=readUsers();$before=count($db['users']);$db['users']=array_values(array_filter($db['users'],fn($u)=>$u['id']!==$m[1]||$u['role']==='superadmin'));
 if(count($db['users'])===$before)out(['success'=>false,'message'=>'Usuario no encontrado o protegido'],404);
 saveUsers($db);out(['success'=>true]);
}
// Public publications and anonymous citizen submissions stay accessible.
$publicRead=($method==='GET'&&preg_match('~^/projects/by-slug/[^/]+$~',$path));
$publicWrite=($method==='POST'&&$path==='/citizen-inquiries');
if(!$publicRead&&!$publicWrite){
 requireUser();
 if(!in_array($method,['GET','HEAD','OPTIONS'],true))csrfCheck();
}

$db=readDb();

// Chunked media storage: avoids browser localStorage and PHP single-request upload limits.
if($path==='/media/chunk'&&$method==='POST'){
  $b=body();$uploadId=(string)($b['uploadId']??'');$index=$b['index']??null;$data=$b['data']??null;
  if(!preg_match('/^[a-zA-Z0-9_-]{12,100}$/',$uploadId)||!is_int($index)||$index<0||!is_string($data))out(['success'=>false,'message'=>'Bloque inválido'],400);
  $bytes=base64_decode($data,true);
  if($bytes===false||strlen($bytes)>1500000)out(['success'=>false,'message'=>'Bloque demasiado grande'],400);
  $folder=$dataDir.'/uploads-tmp';if(!is_dir($folder))mkdir($folder,0750,true);
  if(!file_exists($folder.'/.htaccess'))file_put_contents($folder.'/.htaccess',"Require all denied\n");
  $file=$folder.'/'.$uploadId.'.part';
  $fp=fopen($file,$index===0?'wb':'ab');if(!$fp||!flock($fp,LOCK_EX))out(['success'=>false],500);
  fwrite($fp,$bytes);flock($fp,LOCK_UN);fclose($fp);
  out(['success'=>true]);
}
if($path==='/media/finish'&&$method==='POST'){
  $b=body();$id=(string)($b['uploadId']??'');$type=(string)($b['mime']??'');
  if(!preg_match('/^[a-zA-Z0-9_-]{12,100}$/',$id))out(['success'=>false],400);
  $extensions=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif','image/avif'=>'avif'];
  if(!isset($extensions[$type]))out(['success'=>false,'message'=>'Formato de imagen no admitido'],400);
  $part=$dataDir.'/uploads-tmp/'.$id.'.part';
  if(!is_file($part))out(['success'=>false,'message'=>'Archivo incompleto'],400);
  $actual=(new finfo(FILEINFO_MIME_TYPE))->file($part);
  if($actual!==$type)out(['success'=>false,'message'=>'El archivo no coincide con su formato'],400);
  $dir=$root.'/media';if(!is_dir($dir))mkdir($dir,0755,true);
  $filename=$id.'.'.$extensions[$type];if(!rename($part,$dir.'/'.$filename))out(['success'=>false],500);
  out(['success'=>true,'url'=>'/elecciones/media/'.$filename]);
}

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
