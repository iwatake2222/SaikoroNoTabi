/*
 *  半自動サイコロの旅アプリ用サブクラス
 *  描画関連のクラスと、汎用の描画関数群
 *  TextType = JavaScript
 */
 
/***** フリップ領域描画用クラス *****/
function C_FlipArea()  {
	/*** publicメンバ変数 ***/
	/* なし */
	/*** privateメンバ変数 ***/
	/* フリップCanvasのコンテキスト */
	var m_flipCtx;
	/* フリップ領域のサイズ */
	var m_canvasWidth;
	var m_canvasHeight;
	var m_stepHeight;
	/* 各フリップの座標とサイズ */
	var m_flipPosX;
	var m_flipPosY;
	var m_flipWidth;
	var m_flipHeight;
	/* 各フリップのテキスト開始位置 */
	var m_flipTextX;
	var m_flipTextY;
	/* フリップ点滅用カウンタ */
	var m_blinkTimes = 0;

	/*** public関数 ***/
	/* フリップ領域の初期化(枠だけ描画) */
	this.InitFlipCanvas = function()
	{
		/* フリップ領域Canvasを取得 */
		var canvasObj = document.getElementById("flipCanvas");	//消えないよね？
		m_flipCtx     = canvasObj.getContext("2d");
		/* フリップ領域の座標などを取得 */
		m_canvasWidth  = canvasObj.width;
		m_canvasHeight = canvasObj.height;
		m_stepHeight   = m_canvasHeight/6;
		/* 各フリップを描画するための座標を設定 */
		m_flipPosX   = MARGIN_LEFT;
		m_flipPosY   = MARGIN_TOP;
		m_flipWidth  = m_canvasWidth - m_flipPosX*2;
		m_flipHeight = m_stepHeight  - m_flipPosY;
		/* 枠を描画する */
		DrawFlip();
	}
	
	/* フリップに行き先を書く(1行) */
	this.WriteText = function(index, str)
	{
		if(str.length < 10){
			m_flipCtx.font = "oblique bold 20pt 'MS ゴシック'";
		} else if(str.length < 15){
			m_flipCtx.font = "oblique bold 18pt 'MS ゴシック'";
		} else {
			m_flipCtx.font = "oblique bold 16pt 'MS ゴシック'";
		}
		m_flipCtx.fillText(str, m_flipTextX, m_flipTextY+20+ m_stepHeight*index); 
	}
	
	/* フリップに行き先を書く(2行) */
	this.WriteText2 = function(index, str1, str2)
	{
		if(str1.length < 10){
			m_flipCtx.font = "oblique bold 16pt 'MS ゴシック'";
			m_flipCtx.fillText(str1, m_flipTextX, m_flipTextY+20+ m_stepHeight*index - 2); 
			m_flipCtx.font = "oblique bold 12pt 'MS ゴシック'";
			m_flipCtx.fillText(str2, m_flipTextX, m_flipTextY+20+ m_stepHeight*index +18); 
		} else if(str1.length < 15){
			m_flipCtx.font = "oblique bold 14pt 'MS ゴシック'";
			m_flipCtx.fillText(str1, m_flipTextX, m_flipTextY+20+ m_stepHeight*index - 2); 
			m_flipCtx.font = "oblique bold 12pt 'MS ゴシック'";
			m_flipCtx.fillText(str2, m_flipTextX, m_flipTextY+20+ m_stepHeight*index +18); 
		} else {
			m_flipCtx.font = "oblique bold 12pt 'MS ゴシック'";
			m_flipCtx.fillText(str1, m_flipTextX, m_flipTextY+20+ m_stepHeight*index - 2); 
			m_flipCtx.font = "oblique bold 10pt 'MS ゴシック'";
			m_flipCtx.fillText(str2, m_flipTextX, m_flipTextY+20+ m_stepHeight*index +16); 
		}
		

		
	}
	
	/* 指定された目のフリップ(1～6)を点滅させる */
	this.HighlightFlip = function(index)
	{
		var hdlBlinkResult = setInterval(blinkResult, 500);
		var m_blinkTimes  = 0;
		function blinkResult()
			{
			if(m_blinkTimes%2 == 0){
				m_flipCtx.strokeStyle  ="RED";
				m_flipCtx.lineWidth  = 5;
				rectRound(m_flipCtx, m_flipPosX, m_flipPosY + (index-1)*m_stepHeight, m_flipWidth, m_flipHeight, 10);
				if(m_blinkTimes == 6){
					clearInterval(hdlBlinkResult);
				}
			} else {
				m_flipCtx.strokeStyle  = FLIP_COLOR[(g_dice.diceResult-1)];
				m_flipCtx.lineWidth  = 5;
				rectRound(m_flipCtx, m_flipPosX, m_flipPosY + (index-1)*m_stepHeight, m_flipWidth, m_flipHeight, 10);
			}
			m_blinkTimes = m_blinkTimes +1;
		}
	
	}

	/*** private関数 ***/
	/* フリップ領域の枠を描画する */
	var DrawFlip = function()
	{
		/* サイコロを描画するための座標を設定 */
		var marginLeftDice = m_flipPosX + MARGIN_LEFT*2;
		var marginTopDice  = m_flipPosY  + MARGIN_TOP;
		var sizeDice       = m_flipHeight - marginTopDice;

		/* 後の処理用に、テキスト出力する座標をグローバル変数に格納しておく */
		m_flipTextX = marginLeftDice + sizeDice + MARGIN_LEFT;
		m_flipTextY = marginTopDice;

		for (var y=0; y<6; y++){
			// 各フリップの背景を塗る
			m_flipCtx.fillStyle = FLIP_COLOR[y];
			fillRectRound(m_flipCtx, m_flipPosX, m_flipPosY + y*m_stepHeight, m_flipWidth, m_flipHeight, 10);
			// サイコロの白を塗る
			m_flipCtx.fillStyle = "WHITE";
			fillRectRound(m_flipCtx, marginLeftDice, marginTopDice + y*m_stepHeight, sizeDice, sizeDice, 10);
		}
	
		// 各サイコロの目を塗る
		// サイコロの中心点の座標として再定義
		// 黒目のサイズは直値なので、レイアウトを変更したらあわせて変える必要があるかも
		marginLeftDice = marginLeftDice + sizeDice/2;
		marginTopDice  = marginTopDice + sizeDice/2;
		// 1
		drawDiceCircle(m_flipCtx, marginLeftDice, marginTopDice, sizeDice, 1);
		// 2
		marginTopDice  += m_stepHeight;
		drawDiceCircle(m_flipCtx, marginLeftDice, marginTopDice, sizeDice, 2);
		// 3
		marginTopDice  += m_stepHeight;
		drawDiceCircle(m_flipCtx, marginLeftDice, marginTopDice, sizeDice, 3);
		// 4
		marginTopDice  += m_stepHeight;
		drawDiceCircle(m_flipCtx, marginLeftDice, marginTopDice, sizeDice, 4);
		// 5
		marginTopDice  += m_stepHeight;
		drawDiceCircle(m_flipCtx, marginLeftDice, marginTopDice, sizeDice, 5);
		// 6
		marginTopDice  += m_stepHeight;
		drawDiceCircle(m_flipCtx, marginLeftDice, marginTopDice, sizeDice, 6);
	}
}


/*** 汎用の描画関数 ***/

/***** サイコロの目だけを描画する関数 *****/
function drawDiceCircle(ctx, x, y, sizeDice, num)
{
	switch (num){
	case 1:
		ctx.fillStyle = "RED";
		ctx.beginPath();
		ctx.arc(x, y, 8, 0, 2*Math.PI, false);
		ctx.fill();
		break;
	case 2:
		ctx.fillStyle = "BLACK";
		ctx.beginPath(); ctx.arc(x - sizeDice/4, y - sizeDice/4, 6, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/4, y + sizeDice/4, 6, 0, 2*Math.PI, false); ctx.fill();
		break;
	case 3:
		ctx.fillStyle = "BLACK";
		ctx.beginPath(); ctx.arc(x - sizeDice/4, y - sizeDice/4, 5, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x,              y,              5, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/4, y + sizeDice/4, 5, 0, 2*Math.PI, false); ctx.fill();
		break;
	case 4:
		ctx.fillStyle = "BLACK";
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y - sizeDice/5, 5, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y - sizeDice/5, 5, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y + sizeDice/5, 5, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y + sizeDice/5, 5, 0, 2*Math.PI, false); ctx.fill();
		break;
	case 5:
		ctx.fillStyle = "BLACK";
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y - sizeDice/5, 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y - sizeDice/5, 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x,              y,              4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y + sizeDice/5, 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y + sizeDice/5, 4, 0, 2*Math.PI, false); ctx.fill();
		break;
	case 6:
		ctx.fillStyle = "BLACK";
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y - sizeDice/4, 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y - sizeDice/4, 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y             , 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y             , 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x + sizeDice/5, y + sizeDice/4, 4, 0, 2*Math.PI, false); ctx.fill();
		ctx.beginPath(); ctx.arc(x - sizeDice/5, y + sizeDice/4, 4, 0, 2*Math.PI, false); ctx.fill();
		break;
	default:
		// 実装ミス
	}
}

/***** 角丸四角形(FILL)を描画する関数 *****/
var fillRectRound = function (ctx, x, y, w, h, r)
{
	x = x + r;
	y = y + r;
	w = w - 2*r;
	h = h - 2*r;

	var pi = Math.PI;
	ctx.beginPath();
	ctx.arc(x  , y  , r, - 1.0 * pi, - 0.5 * pi, false);
	ctx.arc(x+w, y  , r, - 0.5 * pi,   0.0 * pi, false);
	ctx.arc(x+w, y+h, r,   0.0 * pi,   0.5 * pi, false);
	ctx.arc(x,   y+h, r,   0.5 * pi,   1.0 * pi, false);
	ctx.closePath();
	ctx.fill();
}

/***** 角丸四角形を描画する関数 *****/
var rectRound = function (ctx, x, y, w, h, r)
{
	x = x + (r + ctx.lineWidth/2);
	y = y + (r + ctx.lineWidth/2);
	w = w - 2*(r + ctx.lineWidth/2);
	h = h - 2*(r + ctx.lineWidth/2);

	var pi = Math.PI;
	ctx.beginPath();
	ctx.arc(x  , y  , r, - 1.0 * pi, - 0.5 * pi, false);
	ctx.arc(x+w, y  , r, - 0.5 * pi,   0.0 * pi, false);
	ctx.arc(x+w, y+h, r,   0.0 * pi,   0.5 * pi, false);
	ctx.arc(x,   y+h, r,   0.5 * pi,   1.0 * pi, false);
	ctx.closePath();
	ctx.stroke();
}



