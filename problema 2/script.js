function clearInputs() {
    document.getElementById('participants').value = '';
    document.getElementById('division-value').innerHTML = '';
    document.getElementById('title').value = '';
    document.querySelector('input[name="division"][value="teams"]').checked = true;
    document.getElementById('resultScreen').style.display = 'none';
    document.querySelector('.flex-container').style.display = 'flex';
}

function generateTeams() {
    const participantsText = document.getElementById('participants').value.trim();
    const participants = participantsText.split('\n').map(p => p.trim()).filter(p => p.length > 0);

    if (participants.length === 0 || participants.length > 100) {
        alert('Por favor, ingresa entre 1 y 100 participantes.');
        return;
    }

    if (participants.some(p => p.length > 50)) {
        alert('Cada participante debe tener un máximo de 50 caracteres.');
        return;
    }

    const divisionType = document.querySelector('input[name="division"]:checked').value;
    const divisionValue = parseInt(document.getElementById('division-value').value);
    const title = document.getElementById('title').value || 'Equipos Generados';

    const shuffled = participants.sort(() => Math.random() - 0.5);
    let teams = [];

    if (divisionType === 'teams') {
        const membersPerTeam = Math.ceil(shuffled.length / divisionValue);
        for (let i = 0; i < divisionValue; i++) {
            const start = i * membersPerTeam;
            const end = start + membersPerTeam;
            teams.push(shuffled.slice(start, end));
        }
    } else {
        const teamsCount = Math.ceil(shuffled.length / divisionValue);
        for (let i = 0; i < teamsCount; i++) {
            const start = i * divisionValue;
            const end = start + divisionValue;
            teams.push(shuffled.slice(start, end));
        }
    }

    teams = teams.filter(team => team.length > 0);

    document.querySelector('.flex-container').style.display = 'none';
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.style.display = 'block';

    document.getElementById('resultTitle').textContent = title;
    const teamsContainer = document.getElementById('teamsContainer');
    teamsContainer.innerHTML = '';

    teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team-box';
        teamDiv.innerHTML = `<h3>Equipo ${index + 1}</h3><ul>${team.map(member => `<li>${member}</li>`).join('')}</ul>`;
        teamsContainer.appendChild(teamDiv);
    });

    window.currentTeams = teams;
}

function copyToClipboard() {
    const teams = window.currentTeams || [];
    const text = teams.map((team, index) => `Equipo ${index + 1}:\n${team.join('\n')}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
        alert('Equipos copiados al portapapeles.');
    });
}

function copyColumns() {
    const teams = window.currentTeams || [];
    const maxLength = Math.max(...teams.map(team => team.length));
    const rows = [];

    for (let i = 0; i < maxLength; i++) {
        const row = teams.map(team => team[i] || '').join('\t');
        rows.push(row);
    }

    const header = teams.map((_, i) => `Equipo ${i + 1}`).join('\t');
    const text = `${header}\n${rows.join('\n')}`;

    navigator.clipboard.writeText(text).then(() => {
        alert('Equipos copiados en formato de columnas.');
    });
}

function downloadJPG() {
    alert('Función no disponible en esta versión sin librerías externas.');
}

// Cargar opciones por defecto al iniciar
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('input[name="division"]:checked').dispatchEvent(new Event('change'));
});

// Actualiza opciones del select
document.querySelectorAll('input[name="division"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const divisionValue = document.getElementById('division-value');
        divisionValue.innerHTML = '';
        const type = radio.value;
        const participantsCount = document.getElementById('participants').value.split('\n').filter(p => p.trim()).length || 10;

        for (let i = 2; i <= Math.min(10, participantsCount); i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = type === 'teams' ? `${i} equipos` : `${i} participantes por equipo`;
            divisionValue.appendChild(option);
        }
    });
});
