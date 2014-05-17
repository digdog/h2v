/*
The MIT License (MIT)

Copyright (c) 2014 Ching-Lan 'digdog' Huang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

function transform(input) {
  // space and ASCII 21 to 7E fullwidth conversion
  // REFERENCE: http://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms
  var fullwidthConverted = input.replace(/[\u0020-\u007E]/g, function(match){
      var charCode = match.charCodeAt(0);
      charCode = (charCode == 32) ? 0x3000 : charCode + 0xFEE0;

    return String.fromCharCode(charCode);
  });

  // TODO: Convert ... or 。。。 to PRESENTATION FORM FOR VERTICAL HORIZONTAL ELLIPSIS (U+FE19,︙)

  // Chinese vertical punctuation conversion
  var output = fullwidthConverted.replace(/[\u2014\u2026\u22EF\u3008-\u3011\u3016\u3017\uFF08\uFF09\uFF5E]/g, function(match){
    var charCode = match.charCodeAt(0);

    switch(charCode){
      case 0x300C: //'「'
      case 0x300D: //'」'
      case 0x300E: //'『'
      case 0x300F: //'』'
        charCode += 0xCE35;
        break;
      case 0xFF08: //'（'
      case 0xFF09: //'）'
        charCode -= 0x00D3;
        break;
      case 0x2014: //'—'
        charCode = 0xFE31;
        break;
      case 0x22EF: //'⋯'
      case 0x2026: //'…'
      	charCode = 0xFE19;
      	break;
      case 0xFF5E: //'～'
      	charCode = 0x2307;
      	break;
      case 0x300A: //'《'
      case 0x300B: //'》'
        charCode += 0xCE33;
        break;
      case 0x3010: //'【'
      case 0x3011: //'】'
        charCode += 0xCE2B;
        break;
      case 0x3008: //'〈'
      case 0x3009: //'〉'
        charCode += 0xCE37;
        break;
      case 0x3016: //'〖'
      case 0x3017: //'〗'
        charCode += 0xCE01;
        break;
    }

    return String.fromCharCode(charCode);
  });

  return output;
}

function h2vConvert(input, totalRows)
{
	function rotate90(a) {
	  	// http://www.codesuck.com/2012/02/transpose-javascript-array-in-one-line.html
  		a = Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
  		// row reverse
  		for (i in a){
    		a[i] = a[i].reverse();
  		}
  		return a;
	}

    // insert white spaces at the end of each paragraph
    var paragraphs = input.split("\n");
    for (var index in paragraphs) {
        var fullwidthSpaceForLastColumnInParagraph = totalRows - paragraphs[index].length % totalRows;
        if (fullwidthSpaceForLastColumnInParagraph != totalRows) {
	        // Array(foo).join(bar); means repeating bar for foo-1 times.
    	    paragraphs[index] += Array(fullwidthSpaceForLastColumnInParagraph+1).join(String.fromCharCode(0x3000));
        }
    }

    // insert new lines to the head, so that result can correctly break into rows after matrix transposed
    var article = Array(totalRows+1).join("\n") + paragraphs.join("");

    // convert String article into matrix that has totalRows columns
    var matrix = [];
    var charOfArray = article.split("");
    while(charOfArray[0]) {
      matrix.push(charOfArray.splice(0, totalRows));
    }

    // matrix transposed, joined elements, and replace array of array's separetor with space
    return rotate90(matrix).join("").replace(/(^|\,)/g, " ").replace(/\n/g, "\n ");
}
