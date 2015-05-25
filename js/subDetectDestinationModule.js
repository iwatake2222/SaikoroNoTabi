/*
 *  半自動サイコロの旅アプリ用サブクラス
 *  各目の行き先を決定するのクラス
 *  TextType = JavaScript
 */

/* m_destLocationIndexのENUM */
var NO_USE = -1;	// 未使用
var OPT_1  = -2;	// ここで一泊
var OPT_2  = -3;	// 目的地で一泊
var OPT_3  = -4;	// 目的地で観光
var OPT_4  = -5;	// 深夜バス
var OPT_5  = -6;	// ルートがなければここで一泊
var OPT_6  = -7;	//

	
/***** 各目の行き先を決定するクラス *****/
function C_DetectDestination()  {
	/*** publicメンバ変数 ***/
	/* なし */
	/*** privateメンバ変数 ***/
	
	/* 決定した行き先の名前                                                               */
	/*   行き先決定中は、インデックス番号の重複を避けるためのフラグ(未使用時はマイナス値) */
	/*   さらに、オプションとしても使う                                                   */
	/*   未使用時は-1(未使用),-2(未使用でありオプション1の目とする),-3(未使用でありオプション2の目とする),... */
	var m_destLocationIndex = new Array("-1", "-1", "-1", "-1", "-1", "-1");

	/* 各目で許容する現在地からの距離 */
	var m_allowedDistance = new Array(400, 400, 400, 400, 400, 400);
	
	/* 最寄の深夜バス乗り場への距離 */
	var m_minimumBusStationDistance = 9999;
	
	/* 最寄の深夜バス乗り場の名前(BUS_TABLEのキー) */
	var m_busStation = "";
	
	/* 最寄の深夜バス乗り場から、現時点で乗車可能なバスリスト */
	var m_busList = new Array();


	/*** public関数 ***/
	/* サイコロの目から行き先のインデックス番号(LOCATION_TABLE)を取得する */
	this.GetDestLocationIndex = function(index)
	{
		return m_destLocationIndex[index];
	}
	
	/* 最も近い深夜バス乗り場を探す */
	this.SearchBusStation = function()
	{
		for(var busStation in BUS_TABLE){
			getDistance(g_nowLocation, busStation, busStation, function(distance, prm){
				/* 一番近い場所を決める */
				/* memo:シングルスレッドであれば、変数の排他処理は不要のはず */
				if( distance < m_minimumBusStationDistance){
					m_minimumBusStationDistance = distance;
					m_busStation = prm;
				}
			});
		}
	}
	

	this.Init = function()
	{
		/* 行き先テーブルを作成 */
		MakeTargetLocationTable();
		/* 深夜バステーブルを作成 */
		MakeBusTable();
	}
	
	/* すべての目の行き先を決定する */
	this.DecideAll = function(){
		/*** まず、各目のオプション(種別)を決める ***/
		GenerateOption();

		/*** 各目の行き先をランダムに決める ***/
		/* - 決め方：①ランダムに行き先候補を選ぶ                                                                      ***/
		/*           ②現在時刻に応じて、宿泊や観光といったオプションを追加                                            ***/
		/*           ③現在位置からの距離(ひとまず車で行った場合)が、設定した範囲内に収まっていればOK。範囲外なら①へ  ***/
		/* - 処理方法：まずは1の目(index=0)でflipMakerを呼び出す。その後、2～6の目行き先は                             ***/
		/*             上記③の処理の結果がコールバックでしか得られないので、コールバック関数内で再帰的に呼び出す      ***/
		DecideEach(this, 0, function(){
			//alert("行き先決定");
		});
	}
	
	
	
	/*** private関数 ***/
	/* 現在時刻に応じて、各目のオプションを決める */
	var GenerateOption = function()
	{
		var nowDate = new Date();
		var nowHour = nowDate.getHours();
		
		nowHour = 18;	// debug
		
		if(nowHour<13){
			/* 昼より前の場合 */
			/* ランダムに、移動or移動先で観光 */
			/* 許容する移動距離は、目に応じて大きくする */
			for(var i=0; i<6; i++){
				m_allowedDistance[i]   = 300 * (i+1);
				switch(Math.floor(Math.random()*3)){
				case 0: m_destLocationIndex[i] = NO_USE; break;
				case 1: m_destLocationIndex[i] = NO_USE; break;
				case 2: m_destLocationIndex[i] = OPT_3; break;
				}
			}
		} else if(nowHour<17){
			/* 15時より前の場合 */
			/* ランダムに、移動or移動先で観光 */
			/* 許容する移動距離は、目に応じて大きくする */
			for(var i=0; i<6; i++){
				m_allowedDistance[i]   = 200 * parseInt(i/3+1);
				switch(Math.floor(Math.random()*3)){
				case 0: m_destLocationIndex[i] = NO_USE; break;
				case 1: m_destLocationIndex[i] = NO_USE; break;
				case 2: m_destLocationIndex[i] = OPT_3; break;
				}
			}
		} else {
			/* 夕方以降 */
			/** 現時刻で、乗車可能な深夜バスリストを取得 **/
			if(m_minimumBusStationDistance <= 20){	/* バス乗り場までの許容距離は20km */
				for(var i = 0; i<BUS_TABLE[m_busStation].length; i++){
					if(BUS_TIME_TABLE[m_busStation][i] - nowHour >= 2){	/* 出発時刻まで2時間以上余裕があること */
						m_busList.push(BUS_TABLE[m_busStation][i]);
					}
				}
			}
			
			/* 深夜バスの目の数 */
			/*  ひとまず、フリップ内に採用したい個数(2個or3個)を設定し、その後実際に行くことが出来る数に丸める */
			var numBus;
			if(nowHour < 18){numBus = 2;}
			else { numBus = 3;}
			if(m_busList.length<numBus){numBus=m_busList.length;}
			
			var i = 0;
			for(i=0; i<6-numBus; i++){
				m_allowedDistance[i]   = 200 * parseInt(i/3+1);
				switch(Math.floor(Math.random()*3)){
				case 0: m_destLocationIndex[i] = OPT_5; break;
				case 1: m_destLocationIndex[i] = OPT_1; break;
				case 2: m_destLocationIndex[i] = OPT_2; break;
				}
			}
			
			for(i=i; i<6; i++){
				m_allowedDistance[i]   = 9999;
				m_destLocationIndex[i] = OPT_4;
			}
		}
	}
	
	/* 再帰的に各目の行き先を決定する */
	/* コールバック関数内ではthisを使えないので、呼び出し元から自objをもらう */
	var DecideEach = function(obj, nowIndex, callback)
	{
		// まず未使用の場所を検索
		var locationNum = Math.floor(Math.random() * LOCATION_TABLE.length);
		while(1){
			for ( var j = 0; j < 6; j++){
				if(m_destLocationIndex[j] == locationNum)break;;
			}
			if (j==6){
				/* 最後まで探して同じインデックス番号が見つからなければ、未使用ということ */
				break;
			}
			locationNum = Math.floor(Math.random() * LOCATION_TABLE.length);
		}
	
		/* 所定の時間以内に収まっているかどうかを確認 */
		getDistance(g_nowLocation, LOCATION_TABLE[locationNum].nameSearch, nowIndex, function(distance, nowIndex){
			if( (distance < 10) || (distance > m_allowedDistance[nowIndex]) ){
				/* 指定の距離以上の場所なら、別の候補を探す */
				DecideEach(obj, nowIndex, callback);
			} else {
				/* 指定の時間以内なら、行き先をフリップに表示して、次の目の場所を探す */
				var option = m_destLocationIndex[nowIndex];
				
				/* オプションに応じて、表示内容を変える */
				switch (option){
				case OPT_1:
					g_flipArea.WriteText(nowIndex, "ここで一泊！！");
					break;
				case OPT_2:
					g_flipArea.WriteText2(nowIndex, LOCATION_TABLE[locationNum].name + "で一泊！ (" + distance + "km)", "※ルートがなければここで一泊");
					break;
				case OPT_3:
					g_flipArea.WriteText(nowIndex, LOCATION_TABLE[locationNum].name + "で観光！ (" + distance + "km)");
					break;
				case OPT_4:
					/* 深夜バスの場合 */
					/* 現時点で乗車可能なバスリストから行き先をランダムに決める */
					var busName = m_busList[Math.floor(Math.random()*m_busList.length)];
					/* 今回決めた行き先をバスリストから削除 */
					for(var i=0; i<m_busList.length; i++){
						if(m_busList[i] == busName){
							m_busList.splice(i, 1);
						}
					}
					g_flipArea.WriteText2(nowIndex, busName, "深夜バス");
					break;
				case OPT_5:
					g_flipArea.WriteText2(nowIndex, LOCATION_TABLE[locationNum].name + " (" + distance + "km)", "※ルートがなければここで一泊");
					break;
				default:
					g_flipArea.WriteText(nowIndex, LOCATION_TABLE[locationNum].name + " (" + distance + "km)");
					break;
				}

				/* 「ここで一泊」と深夜バスの場合以外は、見つかった行き先を使用済みにする */
				if( (option != OPT_1) && (option != OPT_4)){
					m_destLocationIndex[nowIndex] = LOCATION_TABLE[locationNum];
					m_allowedDistance[nowIndex]   = distance;
				}
				
				/* 深夜バスの場合は、目的地はバスの名前 */
				if (option == OPT_4){
					m_destLocationIndex[nowIndex] = busName;
				}
				if (nowIndex == 5){
					// 最後の目が完了していたら処理終了
					callback();
				} else {
					DecideEach(obj, nowIndex+1, callback);
				}
			}
		});
	}
}


/**** 行き先候補のテーブル ****/
function LOCATION_INFO (name, nameSearch, sight, onsen, bus){
	this.name       = name;			/* 名前(表示用)。キー要素  */
	this.nameSearch = nameSearch;	/* 名前(検索用)        */
	this.sight      = sight;		/* 観光名所があるか    */	//未使用
	this.onsen      = onsen;		/* 温泉があるか        */	//未使用
	this.bus        = bus;			/* 深夜バスがあるか    */	//未使用
}
var LOCATION_TABLE = new Array();
var MakeTargetLocationTable = function()
{

	
	/* 行き先のテーブルを作成              name      nameSearch    観光  温泉  深夜バス */
	LOCATION_TABLE.push(new LOCATION_INFO( "北海道", "北海道",     false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "青森",   "青森",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "岩手",   "岩手",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "宮城",   "宮城",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "秋田",   "秋田",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "山形",   "山形",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "福島",   "福島",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "群馬",   "群馬",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "栃木",   "栃木",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "茨城",   "茨城",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "埼玉",   "埼玉",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "千葉",   "千葉",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "東京",   "東京",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "神奈川", "神奈川",     false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "新潟",   "新潟",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "富山",   "富山",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "石川",   "石川",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "福井",   "福井",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "山梨",   "山梨",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "長野",   "長野",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "岐阜",   "岐阜",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "静岡",   "静岡",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "愛知",   "愛知",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "三重",   "三重",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "滋賀",   "滋賀",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "京都",   "京都",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "大阪",   "大阪",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "兵庫",   "兵庫",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "奈良",   "奈良",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "和歌山", "和歌山",     false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "鳥取",   "鳥取",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "島根",   "島根",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "岡山",   "岡山",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "広島",   "広島",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "山口",   "山口",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "徳島",   "徳島",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "香川",   "香川",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "愛媛",   "愛媛",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "高知",   "高知",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "福岡",   "福岡",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "佐賀",   "佐賀",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "長崎",   "長崎",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "熊本",   "熊本",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "大分",   "大分",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "宮崎",   "宮崎",       false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "鹿児島", "鹿児島",     false, false, false));
	LOCATION_TABLE.push(new LOCATION_INFO( "沖縄",   "沖縄",       false, false, false));
	
	LOCATION_TABLE.push(new LOCATION_INFO( "東京",   "千代田区",       false, false, true ));
	
}

/**** 深夜バステーブル ****/
/* 各発着所の行き先配列と出発時刻配列 */
/* インデックスを合わせること         */
var BUS_TABLE      = new Object();
var BUS_TIME_TABLE = new Object();
var MakeBusTable   = function()
{
	BUS_TABLE["東京都新宿"]      = new Array("はかた号(博多)", "大阪", "京都", "サンライズああああ高知号(高知)");
	BUS_TIME_TABLE["東京都新宿"] = new Array(20,       21,    22, 23);
}



