document.addEventListener('DOMContentLoaded', function() {
    const emotionCards = document.querySelectorAll('.emotion-card');
    
    emotionCards.forEach(card => {
        const img = card.querySelector('img');
        
        card.addEventListener('mouseenter', () => {
            // Switch to GIF on hover
            img.src = img.dataset.gif;
        });
        
        card.addEventListener('mouseleave', () => {
            // Switch back to static image when hover ends
            img.src = img.dataset.static;
        });
        
        card.addEventListener('click', () => {
            const emotion = card.dataset.emotion;
            
            // Remove selection from all cards
            emotionCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            card.classList.add('selected');
            
            // Redirect to recommendations page for the selected emotion
            window.location.href = `/recommendations/${emotion}`;
        });
    });
});