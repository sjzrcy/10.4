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
	tinymce.PluginManager.requireLangPack('insertItemTemplate');

	tinymce.create('tinymce.plugins.InsertItemTemplatePlugin', {
	
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
			ed.addCommand('mceInsertItemTemplate', function() {
			
				var template=itemTemplate.handleChooseTemplateEvent();			
				if(template!='')
				{
					ed.execCommand('mceInsertContent', 0, template);		
				}
			});
			
			ed.addCommand('mceDownloadItemTemplate', function() {
			
				itemTemplate.handleDownloadTemplateEvent();			
				
			});
			
			ed.addCommand('mceGotoTemplateHelp', function() {
			
				itemTemplate.handleGotoHelpEvent();				
			});
			
			// Register insertLocalImage button
			
			ed.addButton('insertItemTemplate', {
				title : 'insertItemTemplate.desc',
				cmd : 'mceInsertItemTemplate',
				image : url + '/img/insertItemTemplate.gif'
			});
			
			ed.addButton('downloadItemTemplate', {
				title : 'downloadItemTemplate.desc',
				cmd : 'mceDownloadItemTemplate',
				image : url + '/img/downItemTemplate.gif'
			});
					
			
			ed.addButton('gotoTemplateHelp', {
				title : 'gotoTemplateHelp.desc',
				cmd : 'mceGotoTemplateHelp',
				image : url + '/img/help.gif'
			});
			
			// Add a node change handler, selects the button in the UI when a image is selected
			ed.onNodeChange.add(function(ed, cm, n) {
				
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
				longname : 'InsertItemTemplate plugin',
				author : 'wuxie',
				authorurl : 'http://www.taobao.com',
				infourl : 'http://www.taobao.com',
				version : "1.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('insertItemTemplate', tinymce.plugins.InsertItemTemplatePlugin);
})();