var translit_base = "";
function isDefined(variable)
{
    return eval( '(typeof(' + variable + ') != "undefined");' );
}
if(isDefined('translBase')) translit_base = translBase;
function includeFile(file) {
    document.write( '<script type="text/javascript" src="' + file + '"></script>' );
}
function includeStyleSheet(file, media) {
    document.write('<link rel="stylesheet" type="text/css" media="' + media + '" href="' + file + '"/>');
}
includeFile( translit_base + "cmtranslit_base.js" );
includeFile( translit_base + "tamil.js" );
includeFile( translit_base + "kt.js" );
includeFile( translit_base + "diacritics.js" );
includeFile( translit_base + "legend_src.js" );
