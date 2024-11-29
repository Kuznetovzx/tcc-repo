function transcribeAndDistribute() {
    const imageInput = document.getElementById('image-input');
    const file = imageInput.files[0];

    if (!file) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const image = new Image();
        image.src = event.target.result;

        Tesseract.recognize(
            image,
            'eng',
            { logger: m => console.log(m) } 
        ).then(({ data: { text } }) => {
            console.log('Texto reconhecido:', text);

            // extrair e distribuir corretamente
            const values = extractAndDistributeValues(text);

            if (values) {
                document.getElementById('x-dimension').value = values.x || '';
                document.getElementById('y-dimension').value = values.y || '';
                document.getElementById('z-dimension').value = values.z || '';
                alert('Dimensões extraídas e distribuídas com sucesso.');
            } else {
                alert('Não foi possível encontrar valores válidos para X, Y e Z.');
            }
        }).catch(error => {
            console.error('Erro no OCR:', error);
            alert('Ocorreu um erro ao processar a imagem. Tente novamente.');
        });
    };

    reader.readAsDataURL(file);
}

function extractAndDistributeValues(text) {
    const regex = /X\s*=\s*(\d+)\s*.*?Y\s*=\s*(\d+)\s*.*?Z\s*=\s*(\d+)/i;
    const match = text.match(regex);

    if (match) {
        return {
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
            z: parseInt(match[3], 10),
        };
    }

    return null;
}
