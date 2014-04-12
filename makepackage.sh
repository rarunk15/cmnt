#!/bin/bash
rm -rf package package.zip
mkdir package package/cmnt

cmnt=package/cmnt
mkdir $cmnt/src
mkdir $cmnt/examples


cp -p src/savefile.php src/openfile.php $cmnt
cp -p src/model.js src/view.js src/wiky.js src/audio.js $cmnt/src
cp -pr dhtmlxToolbar $cmnt
sed -e 's@"cmtranslit/@"../cmtranslit/@g' -e 's@../../codepress@src/codepress@g' src/editor.js  > $cmnt/src/editor.js
cp -pr codepress $cmnt/src
cp -pr src/l_and_f $cmnt/src
# fix the path to codebase in cm notation-let and copy it not in the src
# directory but in the base directory
sed -e 's@"file:///.*"@"http://arunk.freepgs.com/cmnt/"@g' src/cmnlet.js  > $cmnt/cmnlet.js

###############################################################
# copy the about.html and manual to the root dir
###############################################################
cp index.html $cmnt
cp doc/about.html $cmnt/about.html
cp doc/manual_with_bookmarks.pdf $cmnt/manual.pdf

###############################################################
# fix about_loc in swaratoolbar.js (we will just copy it again)
# so that it points to an absolute location
###############################################################
$sed -e 's@../doc/about.html@http://arunk.freepgs.com/wordpress/about-cmnt-v15b/@' src/l_and_f/swaratoolbar.js  > $cmnt/src/l_and_f/swaratoolbar.js

############################################
# remove the SVN directories and .swp files
############################################
find $cmnt -name .svn -exec rm -rf {}  >/dev/null 2>&1 \;
find $cmnt -name '*.swp' -exec rm -f {}  >/dev/null 2>&1 \;

###############################################################
# copy the examples songs (after fixing the directory 
# reference to javascript source
##############################################################
cp songs/examples.html $cmnt/examples/examples.html
examples="budhamasrayami candram_bhaja devi_nIyE \
dhruva_alankaram lambodara matya_alankaram neevaada \
neevaada_kannada neevaada_sanskrit neevaada_tamil \
neevaada_telugu ninne_nammi_naanu \
ninne_nammi_naanu_tamil ninnukori sri_kamalaambikaayaam \
sri_varalakshmi suryamurte viriboni"
for i in $examples; do
  sed -e 's@examples/examples@examples@' songs/${i}.html > $cmnt/examples/${i}.html
done
sed -e 's@"\.\./@"./@g' songs/newsong.html > $cmnt/newsong.html

###########################################
# add copy right notice to the javascript
###########################################
scripts="`find $cmnt -name '*.js' -print | grep -v wiky`"
for i in $scripts; do
	cat copyright_notice $i > ${i}_h
	mv ${i}_h $i
	dos2unix $i
done

###########################################
# do cmtranslit stuff
###########################################
pkg_dir=package
dst_dir_base=cmtranslit
mkdir $pkg_dir/$dst_dir_base
dst_dir=$pkg_dir/$dst_dir_base
mainfile_src=cmtranslit/cmtranslit_editor_normal.html
mainfile=editor.php
encr_files="cmtranslit_base.js cmtranslit_editor_tinymce.js english.js tamil.js kt.js legend.js legend_src.js cmtranslit_testbed.js ieform.js diacritics.js"
nonencr_files="openfile.php savefile.php translate.png cmhelp.png grantha_sa.png cmtranslit_editor.css tabs.css tinymce legend.css legend.html cmtranslit_scheme.html cmtranslit_testbed.html" #cmtranslit_test.html
sed -e 's@tiny_mce_src.js@tiny_mce_gzip.js@' -e 's@^\(.*theme_advanced.*\),code,\(.*\)$@\1\2@' $mainfile_src | sed '/REMOVE WHEN PACKAGING/d' | sed /LOAD_CONTENTS/rsave_script.php > $dst_dir/$mainfile
echo '<HTML><HEAD><TITLE>HTTP Redirect</TITLE><META http-equiv="refresh" content="0; URL=editor.php"></HEAD><BODY></BODY></HTML>' > $dst_dir/index.html
for i in $encr_files; do
    # no more obfuscation - we may do it again when code is officially in sourceforge 
    # (so obfuscation is merely a compression)
    #java -jar ../obfuscatejs.jar Obfuscator $i $dst_dir/$i
    cp -pr cmtranslit/$i $dst_dir/$i
    if test $? != 0; then
        exit 1
    fi
done
for i in $nonencr_files; do
    cp -pr cmtranslit/$i $dst_dir
    if test $? != 0; then
        exit 1
    fi
done
# fix code base for cmtranslitlet
sed -e 's@"file:///.*"@"http://arunk.freepgs.com/cmtranslit/"@g' cmtranslit/cmtranslitlet.js  > $dst_dir/cmtranslitlet.js
cp -pr cmtranslit/tinymce $dst_dir >/dev/null 2>&1

############################################
# remove the SVN directories and .swp files
############################################
find package -name .svn -exec rm -rf {}  >/dev/null 2>&1 \;
find package -name '*.swp' -exec rm -f {}  >/dev/null 2>&1 \;
find package -name 'thumbs.db' -exec rm -f {}  >/dev/null 2>&1 \;

# rename %$#! PNG files - stupid Paint
pngs="`find package -name '*.PNG' -print | grep -v wiky`"
for i in $pngs; do
    n=`basename $i`
    d=`dirname  $i`
    nn=`echo $n | tr 'A-Z' 'a-z'`
    mv $i $d/xyz
    mv $d/xyz $d/$nn
done

cd package && zip -q -9 -r ../package.zip  *.* cmtranslit cmnt
