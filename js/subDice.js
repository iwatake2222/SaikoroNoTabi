/*
 *  半自動サイコロの旅アプリ用サブクラス
 *  サイコロ関連のクラス
 *  TextType = JavaScript
 */
 
 /***** サイコロのクラス *****/
function C_Dice(){
	/*** publicメンバ変数 ***/
	/* 結果(1～6) */
	this.diceResult = 0;
	
	/*** privateメンバ変数 ***/
	/* タイマハンドラ */
	var m_hdlThroughingDice;
	/* サイコロの状態(0:振る前、1:振っている最中、2:振った後*/
	var m_status = 0;

	/*** public関数 ***/
	/* サイコロを更新 */
	this.Update = function()
	{
		switch(m_status){
		case (0):
			StartDice();
			break;
		case (1):
			StopDice();
			break;
		default:
			//alert("振りなおし禁止!!");
			break;
		
		}
	
	}
	
	/* サイコロが振られたかどうか                                 */
	/* 不正防止のため、振りなおしや振った後のフリップの更新は禁止 */
	this.isThrown = function()
	{
		if(m_status >= 2){
			return true;
		} else {
			return false;
		}
	}
	
	/*** private関数 ***/
	/* サイコロを振りはじめる */
	var StartDice = function()
	{
		m_hdlThroughingDice = setInterval(UpdateDice,10);
		m_status = 1;
	}
	
	/* サイコロを止める */
	var StopDice = function()
	{
		clearInterval(m_hdlThroughingDice);
		m_status = 2;
	}
	
	/* サイコロの目を更新する（サイコロを振っている最中呼ぶ） */
	var UpdateDice = function()
	{
		var diceCanvasObj =  document.getElementById("diceCanvas");
		var diceContext = diceCanvasObj.getContext("2d");
		var diceSize = diceCanvasObj.width * 0.7
		var marginLeftDice = MARGIN_LEFT + diceSize/2;
		var marginTopDice  = MARGIN_TOP  + diceSize/2;
		diceContext.fillStyle = "WHITE";
		fillRectRound(diceContext, MARGIN_LEFT, MARGIN_TOP, diceSize, diceSize, 10);
		g_dice.diceResult = Math.ceil(Math.random() * 6)
		drawDiceCircle(diceContext, marginLeftDice, marginTopDice, diceSize, g_dice.diceResult);
	}
}

