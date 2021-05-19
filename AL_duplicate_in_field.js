function AL_duplicate_in_field(){
	
	

	duplicate_in_field_dialog();
	
	
	// EXECUTION 

	function duplicate_in_field_dialog(){
		
		var myDialog = new Dialog();
		myDialog.title = "DUPLICATE SELECTION IN FEILD ";
		
		var userInput1 = new NumberEdit();
		userInput1.decimals = 0;
		userInput1.minimum = 1;
		userInput1.maximum = 100;
		userInput1.value = 3;
		userInput1.label = "NUMBER_OF_ROWS";
		
		var userInput2 = new NumberEdit();
		userInput2.decimals = 0;
		userInput2.minimum = 1;
		userInput2.maximum = 100;
		userInput2.value = 3;
		userInput2.label = "NUMBER_OF_COLUMNS";
		
		var userInput3 = new NumberEdit();
		userInput3.decimals = 3;
		userInput3.minimum = 0.00;
		userInput3.maximum = 1000;
		userInput3.value = 50;
		userInput3.label = "PADDING";
		
		myDialog.add( userInput1 );
		myDialog.add( userInput2 );
		myDialog.add( userInput3);
		
		if ( myDialog.exec() )
		{
			

			var request_object = {
				rows:parseFloat(userInput1.value),
				columns:parseFloat(userInput2.value),
				padding:parseFloat(userInput3.value),
			}
			
			scene.beginUndoRedoAccum("duplicate_selection_in_field");

			duplicate_selection_in_field_process(request_object);
			
			scene.endUndoRedoAccum();
			
		}
		

		
	}
	
	
	
	
	
	
	
	
	// FUNCTIONS 


	function duplicate_selection_in_field_process(_request_object){
		
		

			var final_composite_path = "Top/Composite";
			
			var nodes_path_array = selection.selectedNodes();	
			

			var master_top_peg_object = new PegObject(get_top_peg_path(nodes_path_array));
			var master_top_peg_X = master_top_peg_object.get_position().x
			var master_top_peg_Y = master_top_peg_object.get_position().y
			var master_top_peg_Z = master_top_peg_object.get_position().z

			var node_padding_x =400//master_bounding_box.width + 150;
			var node_padding_y =400 //master_bounding_box.height + 150;
			
			var root_x = node.coordX(get_top_peg_path(nodes_path_array));
			var root_y = node.coordY(get_top_peg_path(nodes_path_array));
			 
			var field_comp_x = (root_x+node_padding_x)-100
			var field_comp_y = root_y+( node_padding_y *  (_request_object.rows+1))
			
			
			var field_composite_path = node.add("Top/","field_composite_"+generate_serial(),"COMPOSITE",field_comp_x,field_comp_y,0);
			out_connect_nodes_(field_composite_path,final_composite_path);

			var field_peg_x = (root_x+node_padding_x)-100;
			var field_peg_y = (root_y+node_padding_y)-100;	
			var field_peg_path = node.add("Top/","field_peg_"+generate_serial(),"PEG",field_peg_x,field_peg_y ,0);
			
			for(var i = 1 ; i < _request_object.rows+1 ; i++){
				
				  
				var ny = i * node_padding_y;
				var py = i * _request_object.padding;
				
				var row_serial = "_"+i+"_"+generate_serial();
				var row_under_y = root_y + ny + (node_padding_y -100);
				var row_middle_x = root_x + (node_padding_x *( _request_object.columns+1))/ 2;
				var row_composite_path = node.add("Top/","row_"+row_serial,"COMPOSITE",row_middle_x,row_under_y,0);
				out_connect_nodes_(row_composite_path,field_composite_path);
				
				var row_over_y = root_y + ny -50;
				var row_peg_path = node.add("Top/","row_"+row_serial,"PEG",row_middle_x,row_over_y,0);
				out_connect_nodes_(field_peg_path,row_peg_path);

				for(var j = 1 ; j < _request_object.columns+1 ; j++){
				
					var nx = j * node_padding_x
					var px = j * _request_object.padding

					
					var duplicated_nodes_paths = duplicate_node(nodes_path_array,i*150,0)
					
					move_nodes(duplicated_nodes_paths,nx,ny);
				
					var top_peg_path = get_top_peg_path(duplicated_nodes_paths);
					var top_peg_object = new PegObject(top_peg_path);
					out_connect_nodes_(row_peg_path,top_peg_path);
					
					var new_position = {
						x:master_top_peg_X + px,
						y:master_top_peg_Y + py,
						z:master_top_peg_Z
						
					}
					
					top_peg_object.set_position(new_position);
					
					var last_composite_path = get_last_comp_path(duplicated_nodes_paths);
					out_connect_nodes_(last_composite_path,row_composite_path);
					
					
				
				}
				
				
				
				
			}
			
		
		
	}
	
	function generate_serial(){
		
		return Math.floor(Math.random()*1000000)+"";
	}


	function PegObject(_node_path){
		
		var node_path = _node_path; 
		
		
		this.get_position = function(){
			
			var p ={}
			p.x = parseFloat(node.getTextAttr(node_path, frame.current(), "POSITION.X"));
			p.y = parseFloat(node.getTextAttr(node_path, frame.current(), "POSITION.Y"));
			p.z = parseFloat( node.getTextAttr(node_path, frame.current(), "POSITION.Z"));
			
			return p;
			
		}
		
		this.set_position = function(_p){
			
			 node.setTextAttr(node_path, "POSITION.X", frame.current(),_p.x);
			 node.setTextAttr(node_path, "POSITION.Y", frame.current(),_p.y);
			 node.setTextAttr(node_path, "POSITION.Z", frame.current(),_p.z);
			
		}	
		
	}

	function out_connect_nodes_(_nodeA,_nodeB){
		
		node.link(_nodeA, 0,_nodeB, 0,true, true);
		

	}



	function get_top_peg_path(_nodes_path_array){
		
		for(var n = 0 ; n < _nodes_path_array.length; n++){
			
			var node_path = _nodes_path_array[n]
			if(node.type(node_path) == "PEG"){
				var source = node.srcNode(node_path,0);
				if(source == ""){
					return node_path;
				}
				
			}

		}
		
		return false;
			
		
		
	}

	function get_last_comp_path(_nodes_path_array){
		
		MessageLog.trace("get_last_comp_path");
		
		for(var n = 0 ; n < _nodes_path_array.length; n++){
			
			var node_path = _nodes_path_array[n]
			
			if(node.type(node_path) == "READ" || node.type(node_path) == "COMPOSITE"){
				
				if(node_path.indexOf("FINAL_COMP")!=0){
					MessageLog.trace("compo node_path");
					MessageLog.trace(node_path);
					return node_path;				
				}
				
			}

		}
		
		return false;
			
		
		
	}

	function duplicate_node(_nodes_path_array){
	 

		var myCopyOptions = copyPaste.getCurrentCreateOptions();
		var darg_object = copyPaste.copy(_nodes_path_array,0,1,myCopyOptions)	
		
		var source_node_path = _nodes_path_array[0];
		
		var source_x = node.coordX(source_node_path);
		var source_y = node.coordY(source_node_path);
		var gap = 300
		
		var temp_group_path = node.add("Top/","temp_group"+generate_serial(),"GROUP",source_x+gap,source_y,0);	

		var myPasteOptions = copyPaste.getCurrentPasteOptions();	
		copyPaste. pasteNewNodes(darg_object,temp_group_path,myPasteOptions);


		MessageLog.trace(darg_object);
		MessageLog.trace(node.subNodes(temp_group_path));	
		var duplicated_node_path_array = node.subNodes(temp_group_path)

		
		return explode_group_and_get_nodes(temp_group_path);
		
		
	}


	function explode_group_and_get_nodes(_group_path){
		
		sub_nodes_path_array = node.subNodes(_group_path); 
		
		var future_parent_group = node.parentNode(_group_path);

		var future_paths = [];
		
		for(var n = 0 ; n < sub_nodes_path_array.length; n++){
			
			var current_node_path = sub_nodes_path_array[n];
			
			var current_node_name = get_name_without_group(current_node_path);
			
			var new_node_name = current_node_name+"_"+generate_serial()
			
			MessageLog.trace(new_node_name);
			
			node.rename(current_node_path,new_node_name);
			
			var future_node_name = new_node_name;
			
			
			var future_node_path = future_parent_group+"/"+future_node_name;
			
			future_paths.push(future_node_path);
			
		}	
		
		if(node.explodeGroup(_group_path)){
			
			return future_paths;
			
		}else{
		
			return false;
			
		}
		
		
		
	}

	function get_name_without_group(_node_path){
		
		var split1 =  _node_path.split("/");

		return split1[split1.length-1];
		
	}

	function move_nodes(_node_path_array,_x,_y){
		
		for(var n = 0 ; n < _node_path_array.length; n++){
			
			var node_path = _node_path_array[n]
			var source_x = node.coordX(node_path);
			var source_y = node.coordY(node_path);		
			node.setCoord(node_path,source_x+_x,source_y+_y);
		}
		
		
	}
		
		
		
}
	
