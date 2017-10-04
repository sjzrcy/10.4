/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('insertResource');

	tinymce.create('tinymce.plugins.InsertResourcePlugin', {
	
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mcePopupMenu');
			ed.addCommand('mceInsertLocalImage', function() {
			
				var imageUrlList=localImageChooser.handleImageChooseEvent();			
				for (var i = 0; i < imageUrlList.length; i++) 
				{      
					var imageContent='<img src="'+imageUrlList[i]+'"></img>';
					ed.execCommand('mceInsertContent', i, imageContent);
				}			
			});
			
			ed.addCommand('mceInsertRemoteImage', function() {
			
				var imageUrlList=remoteImageChooser.handleImageChooseEvent();			
				for (var i = 0; i < imageUrlList.length; i++) 
				{      
					var imageContent='<img src="'+imageUrlList[i]+'"></img>';
					ed.execCommand('mceInsertContent', i, imageContent);
				}	
				
			});
			
			ed.addCommand('mceInsertRemoteFlash', function() {
			
				var flashUrlList=remoteFlashChooser.handleFlashChooseEvent();			
				for (var i = 0; i < flashUrlList.length; i++) 
				{
					var flashContent='<EMBED height=360 pluginspage="http://www.macrom edia.com/go/getflashplayer" src="'+flashUrlList[i]+'" type=application/x-shockwave-flash&nb sp;width=500 wmode="transparent" quality="high"></EMBED> ';
					ed.execCommand('mceInsertContent', i, flashContent);
				}	
				
			});

			// Register insertLocalImage button
			ed.addButton('insertLocalImage', {
				title : 'insertLocalImage.desc',
				cmd : 'mceInsertLocalImage',
				image : url + '/img/insertLocalImage.gif'
			});
			
			// Register insertRemoteImage button
			ed.addButton('insertRemoteImage', {
				title : 'insertRemoteImage.desc',
				cmd : 'mceInsertRemoteImage',
				image : url + '/img/insertRemoteImage.gif'
			});
			
			// Register insertRemoteFlash button
			ed.addButton('insertRemoteFlash', {
				title : 'insertRemoteFlash.desc',
				cmd : 'mceInsertRemoteFlash',
				image : url + '/img/insertRemoteFlash.gif'
			});

			// Add a node change handler, selects the button in the UI when a image is selected
			ed.onNodeChange.add(function(ed, cm, n) {
				//cm.setActive('insertResource', n.nodeName == 'IMG');
			});
		},

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
			return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'InsertResource plugin',
				author : 'wuxie',
				authorurl : 'http://www.taobao.com',
				infourl : 'http://www.taobao.com',
				version : "1.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('insertResource', tinymce.plugins.InsertResourcePlugin);
})();