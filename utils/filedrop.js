export function onFileDrop ({targets = [], callback = ()=>{}, activeClass = 'active'}) {
    targets = [...targets];

    // TODO: cleanup listeners?
    disableGlobalDrag();

    targets.forEach(target => {
        target.addEventListener('dragover', dragoverHander);
        target.addEventListener('dragenter', dragoverHander);
        target.addEventListener('drop', dropHander);
        target.addEventListener('dragleave', dragoutHander);
    });

    function dropHander(e) {
        cancelEvent(e);
        if (!e.dataTransfer) return;
        e.target.classList.remove(activeClass);
        callback([...e.dataTransfer.files]);
        return false;
    }

    function dragoutHander (e) {
        cancelEvent(e);
        e.target.classList.remove(activeClass);
        return false;
    }

    function dragoverHander (e) {
        cancelEvent(e);
        e.target.classList.add(activeClass);
        return false;
    }
};

export function fileToBuffer(file) {
    return new Promise((resolve)=>{
        let reader = new FileReader();
        reader.addEventListener('loadend', () => resolve(reader.result));
        reader.readAsArrayBuffer(file);
    }).catch(e => console.error(e));
}

function disableGlobalDrag () {
    document.addEventListener('dragover', cancelEvent);
    document.addEventListener('dragenter', cancelEvent);
    document.addEventListener('drop', cancelEvent);
}

function cancelEvent(e) {
    if (e.preventDefault) e.preventDefault();
    return false;
}

