/*
 *  半自動サイコロの旅アプリ用サブモジュール
 *  その他のユーティリティたち
 *  TextType = JavaScript
 */



function getUrlSearchRoute(from, to)
{
	var url = "http://transit.loco.yahoo.co.jp/search/result?flatlon=&"
	url += "from=" + encodeURI(from) + "&";
	url += "tlatlon=&"
	url += "to=" + encodeURI(to) + "&";
	url += "via=&";
	url += "shin=1&";
	url += "ex=1&";
	url += "al=1&";
	url += "hb=1&";
	url += "lb=1&";
	url += "sr=1&";
	url += "expkind=1&";
	url += "ym=201302&";
	url += "d=19&";
	url += "datepicker=&";
	url += "hh=00&";
	url += "m1=3&";
	url += "m2=7&";
	url += "type=1&";
	url += "ws=2&";
	url += "s=0&";
	url += "x=0&";
	url += "y=0&";
	url += "kw=" + encodeURI(to);
	return url;
}

	//$.get(
	//	//"http://transit.loco.yahoo.co.jp/search/result?flatlon=&from=%E6%9D%B1%E4%BA%AC&tlatlon=&to=%E5%A4%A7%E9%98%AA&via=&shin=1&ex=1&al=1&hb=1&lb=1&sr=1&expkind=1&ym=201302&d=19&datepicker=&hh=22&m1=0&m2=3&type=1&ws=2&s=0&x=0&y=0&kw=%E5%A4%A7%E9%98%AA",
	//	//"http://news.google.co.jp/nwshp?hl=ja&tab=wn",
	//	//"http://news.google.co.jp/",
	//	"http://weather.livedoor.com/forecast/webservice/rest/v1?city=70&day=today",
	//	function(res){
	//		var text = res.responseText;
	//		console.log(text);
	//		alert("a");
	//	}
	//);
	
	//$.get(
	//	"http://transit.loco.yahoo.co.jp/search/result",
	//	//"http://transit.loco.yahoo.co.jp/search/result?flatlon=&from=%E6%9D%B1%E4%BA%AC&tlatlon=&to=%E5%A4%A7%E9%98%AA&via=&shin=1&ex=1&al=1&hb=1&lb=1&sr=1&expkind=1&ym=201302&d=19&datepicker=&hh=23&m1=0&m2=4&type=1&ws=2&s=0&x=0&y=0&kw=%E5%A4%A7%E9%98%AA",
	//	{
	//		flatlon :"",
	//		from :encodeURI("東京"),
	//		tlatlon :"",
	//		to :encodeURI("大阪"),
	//		via :"",
	//		shin :1,
	//		ex :1,
	//		al :1,
	//		hb :1,
	//		lb :1,
	//		sr :1,
	//		expkind :1,
	//		ym :201302,
	//		d :19,
	//		datepicker :"",
	//		hh :"",
	//		m1 :3,
	//		m2 :7,
	//		type :1,
	//		ws :2,
	//		s :0,
	//		x :0,
	//		y :0,
	//		kw :encodeURI("大阪")
	//	},
	//	function(res){
	//		var text = res.responseText;
	//		console.log(text);
	//		alert("a");
	//	}
	//);


/***** 2点間の距離を取得する関数(結果はコールバック関数で返す) *****/
function getDistance(start, end, arg, callback)
{
	Wait(500);	// 更新間隔が早すぎると、うまく動かないので、適当にウェイトを入れる
	var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.DirectionsTravelMode.DRIVING,
		unitSystem: google.maps.DirectionsUnitSystem.METRIC,//単位km表示
		optimizeWaypoints: true,//最適化された最短距離にする。
		avoidHighways: false,//trueで高速道路を使用しない
		avoidTolls: false //trueで有料道路を使用しない
	};

	var directionsService = new google.maps.DirectionsService();
	
	directionsService.route(request, function(response, status)
		{
			if(status == "OK"){
				var legs = response.routes[0].legs;
				var distance = 0;
				for (var i in legs) {
					distance += legs[i].distance.value/1000;
				}
				callback(Math.floor(distance), arg );
			} else {
				callback(99999, arg );
				alert("エラー：" + status + "(" + start + "から" + end + "への距離取得に失敗しました");
			}
		});
}


/***** 現在住所を取得して、g_nowLocationに格納し、表示を更新する *****/
/***** (現在地取得に失敗したら、手動で入力するダイアログを表示)  *****/
function GetNowLocation(callback)
{
	var option = {
		enableHighAccuracy : true,
		timeout : 5*1000,
		maximumAge : 0
	}
	var watchID = null;
	watchID = navigator.geolocation.watchPosition(getPos, errPos, option);

	function getPos(position)
	{
		// 経度と緯度と誤差を取得
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var acc = position.coords.accuracy;

		// 経度/緯度を住所文字列に変換
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(lat, lng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//g_nowLocation = results[1].formatted_address.replace(/^日本, /, '');
				// 県名から町名までを取得
				g_nowLocation = "";
				g_nowPref = "";
				for ( var i = results[0].address_components.length - 1; i >= 0 ; i--){
					if(results[0].address_components[i].types[1] == "political"){
						if(results[0].address_components[i].types[0] != "country"){
							//alert(results[0].address_components[i].long_name);
							g_nowLocation = g_nowLocation + results[0].address_components[i].long_name;
							if(g_nowPref == ""){
								/* 県名だけを取得。一番最初は必ず県名のはずなので、1回だけ入れる */
								g_nowPref = g_nowLocation;
							}
							if(results[0].address_components[i].types[0] == "sublocality"){
								// 町名まで解析したら抜ける
								break;
							}
						}
					}
				}
				callback(acc);
			}
		});
		navigator.geolocation.clearWatch(watchID);
	}

	function errPos(error)
	{
		var message = [ "",
						"ユーザが位置情報の提供を拒否しました",
						"何らかの原因で位置情報を取得出来ませんでした",
						"タイムアウトしました。時間内に位置を特定できませんでした",
					];
		alert(message[error.code]);
		getManualLocation();
	}
	
	function getManualLocation()
	{
		// 現在位置を手動で入力する
		var manualLocation = prompt("現在位置","");
		if (manualLocation == null){
			return;
		} else{
			g_nowLocation = manualLocation;
			callback(0);
		}
	}
}



/***** ウェイト関数 *****/
function Wait( msec ){ 
	var d1 = new Date().getTime(); 
	var d2 = new Date().getTime(); 
	while( d2 < d1+msec ){
		d2=new Date().getTime(); 
	} 
	return; 
} 


