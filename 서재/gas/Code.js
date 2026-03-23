/* ═══ Code.gs — 서재 어구록 GAS ═══ */

var VALID_TOKENS = ['claude-feedback'];
var QUOTES_FOLDER = 'seojai-quotes';
var QUOTES_FILE = 'quotes-data.json';

// ═══ 메인 라우터 ═══
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    console.log('doPost action: ' + data.action);

    if (!data.token || VALID_TOKENS.indexOf(data.token) === -1) {
      return _jsonResponse({ status: 'error', message: 'Unauthorized' });
    }

    var result;
    switch (data.action) {
      case 'add_book':
        result = handleAddBook(data);
        break;
      case 'load_quotes':
        result = handleLoadQuotes(data);
        break;
      case 'list_books':
        result = handleListBooks();
        break;
      case 'import_from_doc':
        result = handleImportFromDoc(data);
        break;
      case 'scan_doc':
        result = handleScanDoc(data);
        break;
      case 'update_author':
        result = handleUpdateAuthor(data);
        break;
      default:
        result = { status: 'error', message: 'Unknown action: ' + data.action };
    }
    return _jsonResponse(result);
  } catch (err) {
    console.error('doPost error:', err);
    return _jsonResponse({ status: 'error', message: String(err) });
  }
}

// ═══ update_author ═══
function handleUpdateAuthor(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = getQuotesData();
    var entries = payload.entries || [];
    var updated = 0;
    var notFound = [];

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var foundIndex = -1;
      for (var j = 0; j < data.length; j++) {
        if (data[j].book === entry.book) {
          foundIndex = j;
          break;
        }
      }

      if (foundIndex !== -1) {
        data[foundIndex].author = entry.author;
        updated++;
      } else {
        notFound.push(entry.book);
      }
    }

    saveQuotesData(data);
    return {
      status: 'ok',
      updated: updated,
      notFound: notFound,
      total: data.length
    };
  } catch (e) {
    console.error('handleUpdateAuthor error:', e);
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return _jsonResponse({ status: 'ok', message: 'seojai-quotes GAS is running' });
}

function _jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══ 파일 접근 ═══
function getQuotesFile() {
  var root = DriveApp.getRootFolder();
  var folders = root.getFoldersByName(QUOTES_FOLDER);
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = root.createFolder(QUOTES_FOLDER);
  }

  var files = folder.getFilesByName(QUOTES_FILE);
  if (files.hasNext()) return files.next();
  return folder.createFile(QUOTES_FILE, '[]', MimeType.PLAIN_TEXT);
}

function getQuotesData() {
  var file = getQuotesFile();
  var content = file.getBlob().getDataAsString('utf-8');
  if (!content || content.trim() === '') return [];
  return JSON.parse(content);
}

function saveQuotesData(data) {
  var file = getQuotesFile();
  file.setContent(JSON.stringify(data, null, 2));
}

// ═══ Google Docs 텍스트 export ═══
function fetchDocText(docId) {
  var url = 'https://docs.google.com/document/d/' + docId + '/export?format=txt';
  var response = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    throw new Error('Failed to fetch doc: HTTP ' + response.getResponseCode());
  }
  return response.getContentText('utf-8');
}

// ═══ add_book ═══
function handleAddBook(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = getQuotesData();

    var existingIndex = -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i].book === payload.book) {
        existingIndex = i;
        break;
      }
    }

    var entry = {
      id: existingIndex !== -1 ? data[existingIndex].id : 'book_' + String(data.length + 1).padStart(3, '0'),
      book: payload.book,
      author: payload.author || '',
      tags: payload.tags || [],
      quotes: payload.quotes || [],
      added: new Date().toISOString().slice(0, 10)
    };

    if (existingIndex !== -1) {
      data[existingIndex] = entry;
    } else {
      data.push(entry);
    }

    saveQuotesData(data);
    return {
      status: 'ok',
      id: entry.id,
      action: existingIndex !== -1 ? 'updated' : 'added',
      total: data.length
    };
  } catch (e) {
    console.error('handleAddBook error:', e);
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ═══ load_quotes ═══
function handleLoadQuotes(payload) {
  try {
    var data = getQuotesData();
    var searchTags = payload.tags || [];
    var keyword = (payload.keyword || '').toLowerCase();
    var limit = payload.limit || 15;
    var results = [];

    for (var i = 0; i < data.length; i++) {
      var book = data[i];
      var matched = false;

      if (searchTags.length > 0) {
        for (var j = 0; j < searchTags.length; j++) {
          if (book.tags.indexOf(searchTags[j]) !== -1) {
            matched = true;
            break;
          }
        }
      }

      if (!matched && keyword) {
        for (var k = 0; k < book.quotes.length; k++) {
          if (book.quotes[k].toLowerCase().indexOf(keyword) !== -1) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        for (var m = 0; m < book.quotes.length; m++) {
          results.push({
            book: book.book,
            author: book.author,
            text: book.quotes[m],
            tags: book.tags
          });
        }
      }
    }

    if (results.length > limit) {
      results = results.slice(0, limit);
    }

    return {
      status: 'ok',
      count: results.length,
      results: results
    };
  } catch (e) {
    console.error('handleLoadQuotes error:', e);
    return { status: 'error', message: e.toString() };
  }
}

// ═══ list_books ═══
function handleListBooks() {
  try {
    var data = getQuotesData();
    var list = [];
    for (var i = 0; i < data.length; i++) {
      list.push({
        id: data[i].id,
        book: data[i].book,
        author: data[i].author,
        tags: data[i].tags,
        quoteCount: data[i].quotes.length
      });
    }
    return {
      status: 'ok',
      total: list.length,
      books: list
    };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

// ═══════════════════════════════════════════════════════
// import_from_doc: Google Docs에서 어구록 일괄 임포트
// ═══════════════════════════════════════════════════════

var BOOK_TITLES = {
  // ── 100권 파일 ──
  '행복의 조건': '인문',
  '일류의 조건': '자기계발',

  // ── 문학 ──
  '이야기의 탄생': '문학',
  '스토리': '문학',
  '흥행하는 글쓰기': '문학',
  '우리는 글쓰기를 너무 심각하게 생각하지': '문학',
  '컬러의 방': '문학',

  // ── 자기계발 ──
  '꾸준함과 루틴의 힘': '자기계발',
  '루틴의 힘': '자기계발',
  '스몰 스텝': '자기계발',
  '아주 작은 반복의 힘': '자기계발',
  '나태한 완벽주의자': '자기계발',
  '미루기의 천재들': '자기계발',
  '결단': '자기계발',
  '자제력 수업': '자기계발',
  '5가지 절대 법칙': '자기계발',
  '내 인생 구하기': '자기계발',
  '다크호스': '자기계발',
  '린치핀': '자기계발',
  '한번이라도 모든 걸 걸어본 적 있나': '자기계발',
  '빠르게 실패하기': '자기계발',
  '에이펙스 스피릿': '자기계발',
  '신경 끄기의 기술': '자기계발',
  '12가지 인생의 법칙': '자기계발',
  '세이노의 가르침': '자기계발',
  '거인의 노트': '자기계발',
  '에디톨로지': '자기계발',
  '더 마인드': '자기계발',
  '위대한 시크릿': '자기계발',
  '1년 안에 부자 되는 법': '자기계발',
  '몰입': '자기계발',
  '성장할 수 있는 용기': '자기계발',
  '생각이 너무 많은 서른 살에게': '자기계발',

  // ── 심리학 ──
  '생각 실험': '심리학',
  '마인드 박스': '심리학',
  '마인드셋': '심리학',
  '클루지': '심리학',
  '인간 본성의 법칙': '심리학',
  '바른 마음': '심리학',
  '뉴 컨피던스': '심리학',
  '도파민네이션': '심리학',
  '공부하는 뇌': '심리학',
  '성취하는 뇌': '심리학',
  '사냥하는 남자 채집하는 여자': '심리학',
  '회복탄력성': '심리학',
  '회복력 수업': '심리학',
  '마음챙김이 일상이 되면': '심리학',
  '생각이 너무 많은 어른들을 위한 심리학': '심리학',
  '내 주위에는 왜 멍청이가 많을까': '심리학',

  // ── 투자경제 ──
  '부자들의 지식창고': '투자경제',
  '제3의 부의 원칙': '투자경제',
  '부의 골든타임': '투자경제',
  '랜덤워크 투자수업': '투자경제',
  '돈의 본능': '투자경제',
  '돈의 심리학': '투자경제',
  '돈은 사람의 마음을 어떻게 움직이는가': '투자경제',
  '부를 설계하다': '투자경제',
  '투자 시프트': '투자경제',
  '나는 카지노에서 투자를 배웠다': '투자경제',
  '부를 부르는 50억 독서법': '투자경제',
  '부자의 사고법': '투자경제',
  '부자들의 개인 도서관': '투자경제',
  '가진 돈을 몽땅 써라': '투자경제',
  '월급만으로는': '투자경제',

  // ── 인문 ──
  '홍세화': '인문',
  '편하게 사는 삶과 인간답게 사는 삶': '인문',
  '분노사회': '인문',
  '미안함에 대하여': '인문',
  '진실의 흑역사': '인문',
  '취향은 어떻게 계급이 되는가': '인문',
  '각자도생': '인문',
  '희망 버리기의 기술': '인문',
  '질서 너머': '인문',
  '선량한 차별주의자': '인문',
  '비참할 땐 스피노자': '인문',
  '삶의 끝에서 비로소 깨닫게 되는 것들': '인문',
  '아주 보통의 행복': '인문',
  '행복의 기원': '인문',
  '이런 세상에서 지혜롭게 산다는 것': '인문',
  '평생 걱정없이 사는 법': '인문',
  '최선의 고통': '인문',

  // ── 실용 ──
  '음식문맹': '실용',
  '음식 문맹자': '실용',
  '밀가루만 끊어도': '실용',
  '알레르기': '실용',
  '당신이 이제껏 참아온 그것, 알레르기입니다': '실용',
  '건강하게 나이 든다는 것': '실용',
  '사랑하지 않으면 아프다': '실용',
  '어른의 문답법': '실용',
  '당신이 옳다': '실용',
  '페어플레이어': '실용',
  '모던 로맨스': '실용',
  '나는내가좋은엄마인줄알았습니다': '실용',
  '조이 오브 워크': '실용',
  '사장으로 견딘다는 것': '실용',
  '티핑 포인트': '실용',
  '우리는 달에 가기로 했다': '실용',
  '관종의 조건': '실용',
  '슈퍼팬': '실용',
  '미디어 조작자': '실용',
  '스틱': '실용',
  'FBI 관찰의 기술': '실용',
  '타인을 읽는 말': '실용',
  '어떻게 살 것인가': '실용',
  '인간 욕망의 법칙': '실용',
  '당신은 설명서도 읽지 않고': '실용',
  '당신은 설명서도 읽지 않고 인생을 살고 있다': '실용',
  '나는 왜 꾸물거릴까': '실용',
  '나는 왜 꾸물거릴까?': '실용',

  // ── 2026년 파일 ──
  '내가 생각한 인생이 아니야': '인문'
};

var CATEGORY_TAGS = {
  '문학': ['문학', '글쓰기', '창작', '서사'],
  '자기계발': ['자기계발', '습관', '동기부여', '성장'],
  '심리학': ['심리학', '뇌과학', '인지', '감정'],
  '투자경제': ['투자', '경제', '부', '돈'],
  '인문': ['인문', '철학', '사회', '삶'],
  '실용': ['실용', '관계', '소통', '건강']
};

function handleImportFromDoc(payload) {
  var docId = payload.docId;
  var text = fetchDocText(docId);
  if (!text || text.length < 100) {
    return { status: 'error', message: '문서를 읽지 못했습니다. 길이: ' + (text ? text.length : 0) };
  }

  var lines = text.split('\n');
  var titleKeys = Object.keys(BOOK_TITLES);

  // 1단계: 각 책 제목이 등장하는 첫 번째 라인 번호 찾기
  var bookPositions = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || /^_{3,}$/.test(line)) continue;

    for (var t = 0; t < titleKeys.length; t++) {
      var title = titleKeys[t];
      if (line === title || (line.indexOf(title) === 0 && line.length <= title.length + 10)) {
        var already = false;
        for (var b = 0; b < bookPositions.length; b++) {
          if (bookPositions[b].title === title) { already = true; break; }
        }
        if (!already) {
          bookPositions.push({ lineNum: i, title: title, category: BOOK_TITLES[title] });
        }
        break;
      }
    }
  }

  bookPositions.sort(function(a, b) { return a.lineNum - b.lineNum; });

  // 2단계: 각 책의 범위 결정
  var data = getQuotesData();
  var imported = 0, updated = 0, skipped = 0;
  var bookResults = [];

  for (var b = 0; b < bookPositions.length; b++) {
    var startLine = bookPositions[b].lineNum + 1;
    var endLine = (b + 1 < bookPositions.length) ? bookPositions[b + 1].lineNum : lines.length;
    var title = bookPositions[b].title;
    var category = bookPositions[b].category;
    var tags = CATEGORY_TAGS[category] || ['기타'];

    // 3단계: 범위 내에서 발췌문 추출
    var quotes = [];
    var currentQuote = [];

    for (var j = startLine; j < endLine; j++) {
      var l = lines[j].trim();

      if (/^_{3,}$/.test(l)) {
        if (currentQuote.length > 0) {
          var qt = currentQuote.join(' ').trim();
          if (qt.length >= 30) quotes.push(qt);
          currentQuote = [];
        }
        continue;
      }

      if (!l) {
        if (currentQuote.length > 0) {
          var qt = currentQuote.join(' ').trim();
          if (qt.length >= 30) {
            quotes.push(qt);
            currentQuote = [];
          }
        }
        continue;
      }

      if (l.length <= 40 && l.length >= 2) {
        var lastCh = l.charAt(l.length - 1);
        if ('.。!?…,다)'.indexOf(lastCh) < 0) {
          if (currentQuote.length > 0) {
            var qt = currentQuote.join(' ').trim();
            if (qt.length >= 30) quotes.push(qt);
            currentQuote = [];
          }
          continue;
        }
      }

      currentQuote.push(l);
    }

    if (currentQuote.length > 0) {
      var qt = currentQuote.join(' ').trim();
      if (qt.length >= 30) quotes.push(qt);
    }

    if (quotes.length === 0) {
      skipped++;
      bookResults.push({ title: title, status: 'skipped', reason: 'no quotes' });
      continue;
    }

    // 4단계: DB에 저장/업데이트
    var existingIdx = -1;
    for (var d = 0; d < data.length; d++) {
      if (data[d].book === title) { existingIdx = d; break; }
    }

    if (existingIdx >= 0) {
      var existing = data[existingIdx];
      var beforeCount = existing.quotes.length;
      for (var q = 0; q < quotes.length; q++) {
        var isDup = false;
        for (var e = 0; e < existing.quotes.length; e++) {
          if (existing.quotes[e] === quotes[q]) { isDup = true; break; }
        }
        if (!isDup) {
          existing.quotes.push(quotes[q]);
        }
      }
      var afterCount = existing.quotes.length;
      updated++;
      bookResults.push({ title: title, status: 'updated', before: beforeCount, after: afterCount });
    } else {
      var padded = String(data.length + 1);
      while (padded.length < 3) padded = '0' + padded;
      var id = 'book_' + padded;

      var newBook = {
        id: id,
        book: title,
        author: '',
        category: category,
        tags: tags,
        quotes: quotes,
        added: new Date().toISOString().split('T')[0]
      };
      data.push(newBook);
      imported++;
      bookResults.push({ title: title, status: 'imported', quotes: newBook.quotes.length });
    }
  }

  saveQuotesData(data);

  return {
    status: 'ok',
    totalBooksInDoc: bookPositions.length,
    imported: imported,
    updated: updated,
    skipped: skipped,
    totalBooksInDB: data.length,
    books: bookResults
  };
}

// ═══ scan_doc: 줄 단위 스캔 — 잠재적 책 제목 후보 추출 ═══
function handleScanDoc(payload) {
  try {
    var docId = payload.docId;
    var text = fetchDocText(docId);

    var lines = text.split('\n');
    var candidates = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      if (!line || /^_{3,}$/.test(line) || line.charAt(0) === '💡') continue;

      if (line.length >= 2 && line.length <= 40) {
        var lastChar = line.charAt(line.length - 1);
        if ('.。!?…, 다)'.indexOf(lastChar) >= 0) continue;

        var matched = matchBookTitle(line);
        var status = matched ? 'MATCH' : 'CANDIDATE';
        candidates.push({
          lineNum: i + 1,
          text: line,
          status: status,
          matchedTo: matched ? matched.title : null
        });
      }
    }

    var titleKeys = Object.keys(BOOK_TITLES);
    var foundInText = [];
    for (var t = 0; t < titleKeys.length; t++) {
      if (text.indexOf(titleKeys[t]) >= 0) {
        foundInText.push(titleKeys[t]);
      }
    }

    return {
      status: 'ok',
      totalLines: lines.length,
      textLength: text.length,
      candidates: candidates.length,
      candidateList: candidates.slice(0, 500),
      bookTitlesFoundInText: foundInText,
      bookTitlesTotal: titleKeys.length
    };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

function matchBookTitle(firstLine) {
  if (BOOK_TITLES[firstLine]) {
    return { title: firstLine, category: BOOK_TITLES[firstLine] };
  }
  var keys = Object.keys(BOOK_TITLES);
  for (var i = 0; i < keys.length; i++) {
    if (firstLine.indexOf(keys[i]) !== -1) {
      return { title: keys[i], category: BOOK_TITLES[keys[i]] };
    }
  }
  return null;
}

function extractQuotes(sectionText, skipLine) {
  var quotes = [];
  var lines = sectionText.split('\n');
  var current = '';
  var pastSkip = (skipLine === null);

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (!pastSkip) {
      if (line === skipLine) {
        pastSkip = true;
        continue;
      }
      if (line.length === 0) continue;
      pastSkip = true;
    }

    if (line.length === 0) {
      if (current.length > 20) {
        quotes.push(current);
      }
      current = '';
    } else {
      if (current.length > 0) current += '\n';
      current += line;
    }
  }

  if (current.length > 20) {
    quotes.push(current);
  }

  return quotes;
}

function saveBookEntry(data, bookInfo) {
  var existingIndex = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i].book === bookInfo.title) {
      existingIndex = i;
      break;
    }
  }

  var entry = {
    id: existingIndex !== -1 ? data[existingIndex].id : 'book_' + String(data.length + 1).padStart(3, '0'),
    book: bookInfo.title,
    author: '',
    tags: CATEGORY_TAGS[bookInfo.category] || ['미분류'],
    category: bookInfo.category,
    quotes: bookInfo.quotes,
    added: new Date().toISOString().slice(0, 10)
  };

  if (existingIndex !== -1) {
    data[existingIndex] = entry;
    return 'updated';
  } else {
    data.push(entry);
    return 'added';
  }
}

// ═══ 디버깅용 (GAS 에디터에서 직접 실행) ═══
function testDocAccess() {
  var docId = '1XnV6UEx0ORogBbapzKE850Kvpu979WPUtXIJdvYi6NY';
  var text = fetchDocText(docId);
  Logger.log('Text length: ' + text.length);
  var sections = text.split(/_{5,}/);
  Logger.log('Sections: ' + sections.length);
  for (var i = 0; i < Math.min(10, sections.length); i++) {
    var s = sections[i].trim();
    if (!s || s.length < 20) continue;
    var lines = s.split('\n');
    var firstLine = '';
    for (var j = 0; j < lines.length; j++) {
      if (lines[j].trim().length > 0) { firstLine = lines[j].trim(); break; }
    }
    var matched = matchBookTitle(firstLine) ? 'MATCH' : 'MISS';
    Logger.log(i + ' [' + matched + '] ' + firstLine.substring(0, 80));
  }
}
