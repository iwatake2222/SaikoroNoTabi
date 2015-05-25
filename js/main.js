/*
 *  半自動サイコロの旅アプリ用JavaScript
 *  TextType = JavaScript
 */

/***** 定数定義 *****/
/* レイアウトのマージン */
var MARGIN_LEFT = 5;
var MARGIN_TOP = 5;
/* 各フリップの背景色 */
var FLIP_COLOR = new Array("#FFCCFF", "#FFCC99", "#FF66FF", "#FFFF33", "#66CCFF", "#99FF99");

/***** グローバル変数定義 *****/
/* 現在住所の文字列 */
var g_nowLocation;	// 詳細住所
var g_nowPref;		// 県名

var g_flipArea   = new C_FlipArea();			// subDrawModule.jsで定義
var g_detectDest = new C_DetectDestination();	// subDetectDestinationModule.jsで定義
var g_dice       = new C_Dice();


/***** ロード時のイベントリスナー *****/
window.addEventListener("load", function(){
	/* フリップ領域の初期化 */
	g_flipArea.InitFlipCanvas();
	g_detectDest.Init();
	
	/* 各メニューを押されたときのイベントリスナーを追加 */
	document.getElementById("updateLocation").addEventListener("click", tapUpdateLocation, true);
	document.getElementById("updateFlip").addEventListener("click", tapUpdateFlip, true);
	document.getElementById("diceThrough").addEventListener("click", tapDiceThrough, true);
	
	var url = getUrlSearchRoute("東京","大阪");

}, true);


/***** 「現在地更新」をタップされたときの処理 *****/
function tapUpdateLocation()
{
	/* 現在住所の更新 */
	var eleNowLoationStr = document.getElementById("nowLoationStr");
	GetNowLocation(function(acc){
		/* 表示を更新 */
		eleNowLoationStr.innerHTML = g_nowLocation + "(誤差:" + parseInt(acc) + "m)";
		
		/* 付近の深夜バス乗り場を探しておく */
		g_detectDest.SearchBusStation();
	});
}

/***** 「フリップ更新」をタップされたときの処理 *****/
function tapUpdateFlip()
{
	if(g_dice.isThrown() == true){
		alert("やり直し禁止");
		return;
	}

	/*** 行き先をランダムに決める ***/
	g_detectDest.DecideAll();
}


/***** 「サイコロ」をタップされたときの処理 *****/
function tapDiceThrough()
{
	if(g_dice.isThrown() == true){
		alert("やり直し禁止");
		return;
	}

	/* サイコロを振るか止めるかする(状態はサイコロクラス内で保持) */
	g_dice.Update();
	if(g_dice.isThrown() == true){
		/* サイコロを振り終わったら、対象の目のフリップ枠を赤くする */
		g_flipArea.HighlightFlip(g_dice.diceResult);
	}

}
