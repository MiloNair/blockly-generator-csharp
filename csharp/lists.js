/* Modified to work with Blockly 2.20190722.1 
27-Sep-2019
Anil Nair
anilnair.au@gmail.com
*/
'use strict';

goog.provide('Blockly.CSharp.lists');

goog.require('Blockly.CSharp');

Blockly.CSharp['lists_create_empty'] = function(block) {
  return ['null', Blockly.CSharp.ORDER_ATOMIC];
};

Blockly.CSharp['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    code[n] = Blockly.CSharp.valueToCode(block, 'ADD' + n,
        Blockly.CSharp.ORDER_COMMA) || 'null';
  }
  code = 'new List<dynamic> {' + code.join(', ') + '}';
  return [code, Blockly.CSharp.ORDER_ATOMIC];
};

Blockly.CSharp['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  if (!Blockly.CSharp.definitions_['lists_repeat']) {
    // Function copied from Closure's goog.array.repeat.
    var functionName = Blockly.CSharp.variableDB_.getDistinctName(
        'lists_repeat', Blockly.Generator.NAME_TYPE);
    Blockly.CSharp.lists_repeat.repeat = functionName;
    var func = [];
    func.push('var ' + functionName + ' = new Func<dynamic, dynamic, List<dynamic>>((value, n) => {');
    func.push('  var array = new List<dynamic>(n);');
    func.push('  for (var i = 0; i < n; i++) {');
    func.push('    array.Add(value);');
    func.push('  }');
    func.push('  return array;');
    func.push('});');
    Blockly.CSharp.definitions_['lists_repeat'] = func.join('\n');
  }
  var argument0 = Blockly.CSharp.valueToCode(block, 'ITEM',
      Blockly.CSharp.ORDER_COMMA) || 'null';
  var argument1 = Blockly.CSharp.valueToCode(block, 'NUM',
      Blockly.CSharp.ORDER_COMMA) || '0';
  var code = Blockly.CSharp.lists_repeat.repeat +
      '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.CSharp.ORDER_FUNCTION_CALL];
};

Blockly.CSharp['lists_length'] = function(block) {
  // List length.
  var argument0 = Blockly.CSharp.valueToCode(block, 'VALUE', Blockly.CSharp.ORDER_FUNCTION_CALL) || 'null';
  return [argument0 + '.Count', Blockly.CSharp.ORDER_MEMBER];
};

Blockly.CSharp['lists_isEmpty'] = function(block) {
  // Is the list empty?
  var argument0 = Blockly.CSharp.valueToCode(block, 'VALUE',
      Blockly.CSharp.ORDER_MEMBER) || 'null';
  return [argument0 + '.Count == 0', Blockly.CSharp.ORDER_LOGICAL_NOT];
};

Blockly.CSharp['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'IndexOf' : 'LastIndexOf';
  var argument0 = Blockly.CSharp.valueToCode(block, 'FIND',
      Blockly.CSharp.ORDER_NONE) || 'null';
  var argument1 = Blockly.CSharp.valueToCode(block, 'VALUE',
      Blockly.CSharp.ORDER_MEMBER) || 'null';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.CSharp.ORDER_MEMBER];
};

Blockly.CSharp['lists_getIndex'] = function(block) {
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.CSharp.valueToCode(block, 'AT',
      Blockly.CSharp.ORDER_UNARY_NEGATION) || '1';
  var list = Blockly.CSharp.valueToCode(block, 'VALUE',
      Blockly.CSharp.ORDER_MEMBER) || 'null';

  if (mode == 'GET_REMOVE') {
      if (where == 'FIRST') {
          at = 1;
      }
      else if (where == 'LAST') {
          at = list + '.Count - 1';
      }
      else {
          // Blockly uses one-based indicies.
          if (Blockly.isNumber(at)) {
              // If the index is a naked number, decrement it right now.
              at = parseFloat(at) - 1;
          } else {
              // If the index is expression, decrement it in code.
              at = '(' + at + ' - 1)';
          }
      }

      if (where == 'FROM_END') {
          at = '(' + list + '.Count) - ' + (at + 1);
      }

    if (!Blockly.CSharp.definitions_['lists_get_remove_at']) {
    var functionName = Blockly.CSharp.variableDB_.getDistinctName(
        'lists_get_remove_at', Blockly.Generator.NAME_TYPE);
    Blockly.CSharp.lists_getIndex.lists_get_remove_at = functionName;
    var func = [];
    func.push('var ' + functionName + ' = new Func<List<dynamic>, int, dynamic>((list, index) => {');
    func.push('  var res = list[index];');
    func.push('  list.RemoveAt(index);');
    func.push('  return res;');
    func.push('});');
    Blockly.CSharp.definitions_['lists_get_remove_at'] =
        func.join('\n');
    }
    code = Blockly.CSharp.lists_getIndex.lists_get_remove_at +
        '(' + list + ', ' + at + ')';
    return [code, Blockly.CSharp.ORDER_FUNCTION_CALL];
  }

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '.First()';
      return [code, Blockly.CSharp.ORDER_MEMBER];
    } else if (mode == 'REMOVE') {
      return list + '.RemoveAt(0);\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '.Last()';
      return [code, Blockly.CSharp.ORDER_MEMBER];
    } else if (mode == 'REMOVE') {
    return list + '.RemoveAt(' + list + '.Count - 1);\n';
    }
  } else if (where == 'FROM_START') {
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.CSharp.ORDER_MEMBER];
    } else if (mode == 'REMOVE') {
      return list + '.RemoveAt(' + at + ');\n';
    }
  } else if (where == 'FROM_END') {
      if (mode == 'GET') {
          var code = list + '[list.Count - ' + at + ']';
          return [code, Blockly.CSharp.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
          return list + '.RemoveAt(list.Count - ' + at + ');\n';
      }
  } else if (where == 'RANDOM') {
    if (!Blockly.CSharp.definitions_['lists_get_random_item']) {
      var functionName = Blockly.CSharp.variableDB_.getDistinctName(
          'lists_get_random_item', Blockly.Generator.NAME_TYPE);
      Blockly.CSharp.lists_getIndex.random = functionName;
      var func = [];
      func.push('var ' + functionName + ' = new Func<List<dynamic>, bool, dynamic>((list, remove) => {');
      func.push('  var x = (new Random()).Next(list.Count);');
      func.push('  if (remove) {');
      func.push('    var res = list[x];');
      func.push('    list.RemoveAt(x);');
      func.push('    return res;');
      func.push('  } else {');
      func.push('    return list[x];');
      func.push('  }');
      func.push('});');
      Blockly.CSharp.definitions_['lists_get_random_item'] =
          func.join('\n');
    }
    code = Blockly.CSharp.lists_getIndex.random +
        '(' + list + ', ' + (mode != 'GET') + ')';
    if (mode == 'GET') {
      return [code, Blockly.CSharp.ORDER_FUNCTION_CALL];
    } else if (mode == 'REMOVE') {
      return code + ';\n';
    }
  }
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.CSharp['lists_setIndex'] = function(block) {
  // Set element at index.
  var list = Blockly.CSharp.valueToCode(block, 'LIST',
      Blockly.CSharp.ORDER_MEMBER) || 'null';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.CSharp.valueToCode(block, 'AT',
      Blockly.CSharp.ORDER_NONE) || '1';
  var value = Blockly.CSharp.valueToCode(block, 'TO',
      Blockly.CSharp.ORDER_ASSIGNMENT) || 'null';

  if (where == 'FIRST') {
    if (mode == 'SET') {
      return list + '[0] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return list + '.Insert(0, ' + value + ');\n';
    }
  } else if (where == 'LAST') {
    if (mode == 'SET') {
      var code = list + '[' + list + '.Count - 1] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
      return list + '.Add(' + value + ');\n';
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseFloat(at) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
        at = '(' + list + '.Count) - ' + (at + 1);
    }
    if (mode == 'SET') {
      return list + '[' + at + '] = ' + value + ';\n';
    } else if (mode == 'INSERT') {
      return list + '.Insert(' + at + ', ' + value + ');\n';
    }
  } else if (where == 'FROM_END') {
    if (mode == 'SET') {
      var code = list + '[' + list + '.Count - ' + at + '] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
      var code = list + '.Insert(' + list + '.Count - ' + at + ', ' + value + ');\n';
      return code;
    }
  } else if (where == 'RANDOM') {
    var xVar = Blockly.CSharp.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    var code = 'var ' + xVar + ' = (new Random()).Next(' + list + '.Count);\n';
    if (mode == 'SET') {
      var code = list + '[' + xVar + '] = ' + value + ';\n';
      return code;
    } else if (mode == 'INSERT') {
        var code = list + '.Insert(' + xVar + ', ' + value + ');\n';
      return code;
    }
  }
  throw 'Unhandled combination (lists_setIndex).';
};

Blockly.CSharp['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.CSharp.valueToCode(block, 'LIST',
      Blockly.CSharp.ORDER_MEMBER) || 'null';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.CSharp.valueToCode(block, 'AT1',
      Blockly.CSharp.ORDER_NONE) || '1';
  var at2 = Blockly.CSharp.valueToCode(block, 'AT2',
      Blockly.CSharp.ORDER_NONE) || '1';
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = 'new List<dynamic>(' + list + ')';
  } else {
    if (!Blockly.CSharp.definitions_['lists_get_sublist']) {
      var functionName = Blockly.CSharp.variableDB_.getDistinctName(
          'lists_get_sublist', Blockly.Generator.NAME_TYPE);
      Blockly.CSharp.lists_getSublist.func = functionName;
      var func = [];
      func.push('var ' + functionName + ' = new Func<List<dynamic>, dynamic, int, dynamic, int, List<dynamic>>((list, where1, at1, where2, at2) => {');
      func.push('  var getIndex = new Func<dynamic, int, int>((where, at) => {');
      func.push('    if (where == "FROM_START") {');
      func.push('      at--;');
      func.push('    } else if (where == "FROM_END") {');
      func.push('      at = list.Count - at;');
      func.push('    } else if (where == "FIRST") {');
      func.push('      at = 0;');
      func.push('    } else if (where == "LAST") {');
      func.push('      at = list.Count - 1;');
      func.push('    } else {');
      func.push('      throw new ApplicationException("Unhandled option (lists_getSublist).");');
      func.push('    }');
      func.push('    return at;');
      func.push('  });');
      func.push('  at1 = getIndex(where1, at1);');
      func.push('  at2 = getIndex(where2, at2);');
      func.push('  return list.GetRange(at1, at2 - at1 + 1);');
      func.push('});');
      Blockly.CSharp.definitions_['lists_get_sublist'] =
          func.join('\n');
    }
    var code = Blockly.CSharp.lists_getSublist.func + '(' + list + ', "' +
        where1 + '", ' + at1 + ', "' + where2 + '", ' + at2 + ')';
  }
  return [code, Blockly.CSharp.ORDER_FUNCTION_CALL];
};


Blockly.CSharp['lists_sort'] = function(block) {
  // List sort int only.
  var argument0 = Blockly.CSharp.valueToCode(block, 'LIST',
      Blockly.CSharp.ORDER_COMMA) || 'null';
      
    var argument1 = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;  	    
        if (!Blockly.CSharp.definitions_['lists_sort']) {
	 
	 var functionName = Blockly.CSharp.variableDB_.getDistinctName(
        'lists_sort', Blockly.Generator.NAME_TYPE);
    Blockly.CSharp.lists_sort.func = functionName;
    var func = [];
    func.push('var ' + functionName + ' =  new Func<List<dynamic>, int, List<dynamic>>( ( '+functionName+'inlist,'+functionName+'inorder)=>{');
    func.push('  var '+ functionName+'out = new List<dynamic>('+functionName+'inlist);');
    func.push('  '+functionName+ 'out.Sort();');
	func.push('  if('+functionName+ 'inorder==-1)');
	func.push('  '+functionName+ 'out.Reverse();');	   
    func.push('  return '+functionName+'out;');
    func.push('});');
    Blockly.CSharp.definitions_['lists_sort'] =
        func.join('\n');
    
		}
	
  var  code = Blockly.CSharp.lists_sort.func +
        '(' + argument0 + ','+argument1+')';
    return [code, Blockly.CSharp.ORDER_FUNCTION_CALL];  
};

Blockly.CSharp['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var value_input = Blockly.CSharp.valueToCode(block, 'INPUT',
      Blockly.CSharp.ORDER_COMMA);
  var value_delim = Blockly.CSharp.valueToCode(block, 'DELIM',
      Blockly.CSharp.ORDER_COMMA) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!value_input) {
      value_input = '""';
    }
	
        var code =   value_input+'.Split('+value_delim+').ToList()';
		return [code, Blockly.CSharp.ORDER_MEMBER]; 
  } else if (mode == 'JOIN') {
    if (!value_input) {
      value_input = '{}';
    }
	
	 var code =   'string.Join('+value_delim+','+ value_input +'.ToArray())';
	return [code, Blockly.CSharp.ORDER_MEMBER]; 
   
  } else {
    throw Error('Unknown mode: ' + mode);
  }
 
  
};
