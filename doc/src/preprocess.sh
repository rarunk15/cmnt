
amidone=0
hostname=`uname`
if test "$hostname" == "Darwin"; then
    tstbase=/tmp/tstfile$$
else
    tstbase=c:/tstfile$$
fi
tstfile=${tstbase}_1.htm
tstfile2=${tstbase}_2.htm
cmdfile=${tstbase}_c
filelist=${tstbase}_f
touch $filelist
cp $1 $tstfile
while test $amidone -eq 0; do
	expressions="`grep '^#include' $tstfile | sed 's@/@\\/@g' | awk '{ printf \"/%s/{\nr%s\nd\n}\n\", $0, $2 }' | sed -e 's@r[\"<]\([^\">]*\)[\">]@r\1@g'`"
	if test -z "$expressions"; then
		amidone=1
		break
	fi
	echo "$expressions" | xargs -0 > $cmdfile
	#cat $cmdfile
	sed -f $cmdfile $tstfile > $tstfile2
	cmp -s $tstfile $tstfile2
	if test $? -eq 0; then
	  echo "expressions had no effect"
	  break
	fi
	mv $tstfile2 $tstfile
done
if test $amidone -eq 1; then
	cat $tstfile
fi
rm -f $tstfile $tstfile2 $cmdfile $filelist
