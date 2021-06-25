define(function() {
		return function(){
				var that =this;
				this.create = function(_titileNo)
				{
					$.ajax({
							url : 'http://vr.afreeca.com/Api/get_random_info',
							dataType : 'jsonp',
							jsonp : "callback",
							data : {title_no:_titileNo},
							success : function ( response ) {
								console.log(response);
								if(response.result==1)
								{
									that.createElement(response.data);
								}else
								{
			
								}
							},
							error : function ( data, status, err ) {
							}
						});
				}

				this.createElement =function(data)
				{					
					var templeteHtml = $('#recommend-template').html();					
					$.each(data, function(key,value){
						var li = $(templeteHtml);
						var duration = value.duration/1000;
						$(li).find('#re_thumbnail').attr('src',value.thumb);
						$(li).find('#link').attr('href',value.url); 
						$(li).find('.cate').text(value.category); 
						$(li).find('.name').text(value.nick);
						$(li).find('.tit').text(value.title);
						$(li).find('.time').text(duration.toHHMMSS());
						$(li).appendTo('#recommend_ul');
					});
				}

		}

});