all: manual chaps

CHAPS= chapters/intro.htm\
chapters/defaultspeeddirective.htm\
chapters/directives.htm\
chapters/gamakaprefsdirective.htm\
chapters/gatidirective.htm\
chapters/headingdirective.htm\
chapters/headingprefsdirective.htm\
chapters/languagedirective.htm\
chapters/languagefontdirective.htm\
chapters/layoutdirective.htm\
chapters/linebreakdirective.htm\
chapters/lyricdirective.htm\
chapters/lyricprefsdirective.htm\
chapters/orientationdirective.htm\
chapters/pagebreakdirective.htm\
chapters/phraseendsdirective.htm\
chapters/songbreakdirective.htm\
chapters/smartlyricmodedirective.htm\
chapters/speedmarksdirective.htm\
chapters/swaradirective.htm\
chapters/swaraprefsdirective.htm\
chapters/taladirective.htm\
chapters/titledirective.htm\
chapters/quickstart.htm\
chapters/assist.htm


CHAPS_SRC:=$(subst chapters/,src/,$(CHAPS)) src/headcontent.htm
manual: input_format_spec.htm

chapters/headcontent: src/headcontent.htm
	@echo $@
	@sed 's@\.\./@../../@g' $< > $@

chapters/%.htm: src/%.htm src/headcontent.htm 
	@echo "Chapter: $<"
	@echo '<html>' > $@.tmp
	@echo '#include "headcontent"' >> $@.tmp
	@echo '<body onLoad="renderFragments();" style="font-family:Lucida Grande,Verdana,Arial,Sans-Serif;font-size:10pt;">' >> $@.tmp
	@echo '<div id="gamakatester"></div>' >> $@.tmp
	@cat $< >> $@.tmp
	@echo '</body></html>' >> $@.tmp
	@cd chapters && ../src/preprocess.sh ../$@.tmp > ../$@
	@rm -f $@.tmp

input_format_spec.htm: src/manual_src.htm $(CHAPS_SRC)
	echo "$@"
	cd src && ./preprocess.sh ../$< | sed -e 's@\(<img.*src="\)\([a-zA-Z0-9]\)@\1src/\2@g' -e 's@\.\./\.\./src/l_and_f@../src/l_and_f@g' > ../$@
	@echo "Follow these steps to complete manual:"
	@echo "1. Open input_format_spec.htm under Opera"
	@echo "2. Print to PDF via primo PDF - save it as manual.pdf"
	@echo "3. Run the following command:"
	@echo "    java -jar pdfWriteBookMarks.jar -jar manual.pdf"
	@echo "		 bookmarks.txt manual_with_bookmarks.pdf"
	@echo "4. Open manual_with_bookmarks.pdf and check bookmarks."
	@echo "5. If any bookmarks have moved, adjust bookmarks.txt (in text editor)"
	@echo "6. If Step 5 was done, go back to step 3"

chapter_view.htm: src/chapter_view_src.htm
	@echo "$@"
	@cd src && ./preprocess.sh ../$< > ../$@


chapter_dir: 
	@ if test ! -d chapters; then\
		mkdir chapters;\
	fi

final:
	@rm -f chapters/headcontent

chap_images:
	@cp src/*.png chapters

chaps: chapter_view.htm chapter_dir chap_images chapters/headcontent $(CHAPS)

clean:
	@rm -rf chapters
	@rm -f chapter_view.htm input_format_spec.htm
