const searchInput = document.getElementById("searchInput");
const searchCount = document.getElementById('search-count');
const contentRoot = document.getElementById('main-doc');

let marks = [];
let currentIndex = -1;
let debounceTimer = null;

function clearHighlights(){
    const existing = contentRoot.querySelectorAll('mark');
    existing.forEach(m => {
        const text = document.createTextNode(m.textContent);
        m.parentNode.replaceChild(text, m);
    });
    marks = [];
    currentIndex = -1;
}

function highlightMatches(query){
    clearHighlights();
    if(!query) {
        searchCount.textContent = 'ادخل بحثًا للبدء';
        return;
    }

    // Optimize: escape regex and compile once
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    
    // Create a filter to skip script/style/mark tags
    const walker = document.createTreeWalker(
        contentRoot,
        NodeFilter.SHOW_TEXT,
        {acceptNode: (node) => {
            const parent = node.parentElement;
            if(!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            // Skip script, style, and mark tags to avoid re-matching
            if(['script', 'style', 'mark'].includes(tag)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }},
        false
    );
    
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if(!node.nodeValue.trim()) return;
        const regex = new RegExp(escapedQuery, 'gi'); // Reset regex for each node
        let match;
        let lastIndex = 0;
        const frag = document.createDocumentFragment();
        let matched = false;
        while((match = regex.exec(node.nodeValue)) !== null){
            matched = true;
            const before = node.nodeValue.slice(lastIndex, match.index);
            if(before) frag.appendChild(document.createTextNode(before));
            const mark = document.createElement('mark');
            mark.textContent = match[0];
            frag.appendChild(mark);
            marks.push(mark);
            lastIndex = match.index + match[0].length;
        }
        if(matched){
            const after = node.nodeValue.slice(lastIndex);
            if(after) frag.appendChild(document.createTextNode(after));
            node.parentNode.replaceChild(frag, node);
        }
    });

    if(marks.length === 0){
        searchCount.textContent = 'لا توجد نتائج';
        return;
    }
    searchCount.textContent = `نتيجة 1 من ${marks.length}`;
    currentIndex = 0;
    goTo(currentIndex);
}

function goTo(index){
    if(!marks.length) return;
    if(index < 0) index = marks.length - 1;
    if(index >= marks.length) index = 0;
    if(currentIndex !== -1 && marks[currentIndex]) marks[currentIndex].classList.remove('active');
    currentIndex = index;
    const el = marks[currentIndex];
    el.classList.add('active');
    el.scrollIntoView({behavior:'smooth', block:'center'});
    searchCount.textContent = `نتيجة ${currentIndex + 1} من ${marks.length}`;
}

searchInput.addEventListener('input', (e) => {
    // Just clear highlights while typing, don't search
    clearHighlights();
});

// allow Enter to move to next result or search immediately
searchInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
        e.preventDefault();
        const query = searchInput.value.trim();
        if(!query) return;
        
        // If no current search, perform new search and go to first result
        if(marks.length === 0){
            highlightMatches(query);
        } else {
            // If search exists, go to next result
            goTo(currentIndex + 1);
        }
    }
});
const btn = document.getElementById("menuBtn");
const nav = document.getElementById("navbar");
const main = document.getElementById("main-doc");
const homeBtn = document.getElementById("homeBtn");


btn.onclick = () => {

    nav.classList.toggle("hide");

    main.classList.toggle("full");

    btn.classList.toggle("move");
    if(homeBtn) homeBtn.classList.toggle('move');

}

// Back to top button behavior
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
    const toggleBackToTop = () => {
        if (window.scrollY > 300) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
    };

    window.addEventListener('scroll', toggleBackToTop);
    window.addEventListener('DOMContentLoaded', toggleBackToTop);

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        backToTop.classList.remove('show');
    });

    backToTop.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            backToTop.click();
        }
    });
}