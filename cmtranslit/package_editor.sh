
pkg_dir=package
dst_dir_base=cmtranslit_new
dst_dir=$pkg_dir/$dst_dir_base
mainfile_src=cmtranslit_editor_normal.html
mainfile=editor.php
encr_files="cmtranslit_base.js cmtranslit_editor_tinymce.js tamil.js kt.js legend.js legend_src.js cmtranslit_testbed.js ieform.js diacritics.js"
nonencr_files="openfile.php savefile.php translate.png cmhelp.png grantha_sa.png cmtranslit_editor.css tabs.css tinymce legend.css legend.html cmtranslit_scheme.html cmtranslit_testbed.html cmtranslit_test.html"
if test -d $pkg_dir; then
   echo -n " remove directory $pkg_dir?"
   read
   if test "$REPLY" == "y"; then
       rm -rf $pkg_dir
   else
	echo "aborting ..."
	exit 0
   fi
   if test -d $pkg_dir; then
        echo "could not remove package directory: $pkg_dir"
	exit 1
   fi
fi
echo "creating directory $pkg_dir, $dst_dir"
mkdir $pkg_dir
if test $? != 0; then
    exit 1
fi
mkdir $dst_dir
if test $? != 0; then
    exit 1
fi

#sed -e 's@tiny_mce_src.js@tiny_mce_gzip.js@' $mainfile_src -e 's@^\(.*theme_advanced.*\),code,\(.*\)$@\1\2@' | sed '/REMOVE WHEN PACKAGING/d' > $dst_dir/$mainfile
sed -e 's@tiny_mce_src.js@tiny_mce_gzip.js@' $mainfile_src -e 's@^\(.*theme_advanced.*\),code,\(.*\)$@\1\2@' | sed '/REMOVE WHEN PACKAGING/d' | sed /LOAD_CONTENTS/rsave_script.php > $dst_dir/$mainfile
echo '<HTML><HEAD><TITLE>HTTP Redirect</TITLE><META http-equiv="refresh" content="0; URL=editor.php"></HEAD><BODY></BODY></HTML>' > $dst_dir/index.html
for i in $encr_files; do
    java -jar ../obfuscatejs.jar Obfuscator $i $dst_dir/$i
    if test $? != 0; then
        exit 1
    fi
done
for i in $nonencr_files; do
    cp -pr $i $dst_dir
    if test $? != 0; then
        exit 1
    fi
done
pwd
cd $pkg_dir && zip -9 -r cmtranslit.zip $dst_dir_base

#rm -rf $dst_dir
