/* jshint -W083 */

define(function(require, exports, module){
	// 预测 
	var predicate = function($table, startIndex){
		var mergeCounts = {};
		mergeCounts[1] = 999;

		for(var i = startIndex; i >= 1; --i){
			var $tds = $("tr td:nth-child(" + i + ")", $table);

			var currentText = "";
			var currentMergeCount = 0;
			var $mergeTd = null;
			var removeTds = [];

			var internalMerge = function(){
				var last = $mergeTd.attr("rowspan");
				if(last === undefined){
					last = 1;
				}else{
					last = parseInt(last);
				}
				
				//记录当前列一次合并的单元格数量
				mergeCounts[i] = (last + currentMergeCount - 1);

				currentText = "";
				currentMergeCount = 0;
				$mergeTd = null;
				removeTds = [];
			};

			for(var j = 0; j < $tds.length; ++j){
				var $td = $($tds[j]);
				if(j === 0){
					$mergeTd = $td;
					currentText = $td.text();
					currentMergeCount = 1;
				}else{
					if($td.text() === currentText){
						/*
							遇到和上一次相同的单元格，将本单元格加入到合并组
							若为最后一个单元格，将本轮单元格合并
						*/
						currentMergeCount += 1;
						removeTds.push($td);

						if(j === $tds.length - 1){
							internalMerge();
						}
					}else{
						/*
							遇到与上一次不同的单元格，将之前的所有单元合并
							然后开始下一轮合并
						*/
						internalMerge();

						$mergeTd = $td;
						currentMergeCount = 1;
						currentText = $td.text();
					}
				}
			}
		}

		/*
		 * 合并原则：
		 * 1.当前一列单元格合并依次的数量少于当前列，则当前列不执行合并动作
		 * 2.由1推出，第一列一定可以合并，因为它没有前一列
		 * 3.由1推出，当当前列不合并时，则它签名所有的列也不再合并
		 */
		for(var m = startIndex; m > 1; --m){
			if(mergeCounts[m] > mergeCounts[m - 1]){ //若前面一列单次合并的单元数量小于本列
				for(var n = m; n <= startIndex; ++n){ //该列及后面的所有列都不合并
					mergeCounts[n] = true;
				}
			}
		}

		return mergeCounts;
	};

	// 执行合并
	var doMerge = function($table, startIndex, mergeCounts){
		//
		for(var i = startIndex; i >= 1; --i){
			if(mergeCounts[i] === true){
				continue;
			}

			var $tds = $("tr td:nth-child(" + i + ")", $table);
			var currentText = "";
			var currentMergeCount = 0;
			var $mergeTd = null;
			var removeTds = [];

			var internalMerge = function(){
				var last = $mergeTd.attr("rowspan");
				if(last === undefined){
					last = 1;
				}else{
					last = parseInt(last);
				}
				
				$mergeTd.attr("rowspan", last + currentMergeCount - 1);
				for(var k = 0; k < removeTds.length; ++k){
					removeTds[k].remove();
				}

				currentText = "";
				currentMergeCount = 0;
				$mergeTd = null;
				removeTds = [];
			};

			for(var j = 0; j < $tds.length; ++j){
				var $td = $($tds[j]);
				if(j === 0){
					$mergeTd = $td;
					currentText = $td.text();
					currentMergeCount = 1;
				}else{
					if($td.text() === currentText){
						/*
							遇到和上一次相同的单元格，将本单元格加入到合并组
							若为最后一个单元格，将本轮单元格合并
						*/
						currentMergeCount += 1;
						removeTds.push($td);

						if(j === $tds.length - 1){
							internalMerge();
						}
					}else{
						/*
							遇到与上一次不同的单元格，将之前的所有单元合并
							然后开始下一轮合并
						*/
						internalMerge();

						$mergeTd = $td;
						currentMergeCount = 1;
						currentText = $td.text();
					}
				}
			}
		}
	};

	//
	var mergeTd = function($table, startIndex){
		if(!$table || $table.length !== 1 || startIndex < 1){
			return;
		}

		// 预测 + 合并
		doMerge($table, startIndex, predicate($table, startIndex));
	};

	//
	module.exports = mergeTd;
});