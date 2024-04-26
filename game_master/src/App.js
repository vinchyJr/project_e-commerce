    import React, { useRef, useEffect } from 'react';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';

    gsap.registerPlugin(ScrollTrigger);

    const App = () => {
        const ref = useRef(null);
        

        useEffect(() => {
            const element = ref.current;
            
            gsap.to(element, {
                x: () => -(element.scrollWidth - document.documentElement.clientWidth) + 'px',
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    pin: true,
                    scrub: 1,
                    end: () => '+=' + element.offsetWidth,
                    onUpdate: self => {
                        if (self.direction === -1) { // Si le défilement est vers le bas
                            gsap.to(element, { x: '0px', ease: 'none' }); // Défiler vers la droite
                        }
                    }
                },
            });
            
            return () => {
                if (ScrollTrigger) {
                    ScrollTrigger.getAll().forEach(t => t.kill());
                }
            };
        }, []);

        // Styles en ligne pour le carrousel et les éléments du carrousel
        const carouselStyle = {
            display: 'flex',  // les enfants (carousel-item) seront côte à côte
            flexWrap: 'nowrap',  // empêcher le retour à la ligne
            overflowX: 'auto', // Affiche les barres de défilement si nécessaire
            overflowY: 'hidden', // Cache les barres de défilement verticales
            scrollbarWidth: 'none', // Cache les barres de défilement de style Webkit
            msOverflowStyle: 'none', // Cache les barres de défilement de style Microsoft Edge
        };

        const carouselItemStyle = {
            flex: '0 0 auto',  // empêcher les éléments de carrousel de grandir ou de rétrécir
            width: '300px',  // définir une largeur fixe pour chaque élément
            marginRight: '10px',  // ajouter de l'espace entre les éléments
        };

        return (
            <div className="App">
                <h1>Video Game Carousel</h1>
                <div className="carousel-container" ref={ref} style={{ overflow: 'hidden' }}>
                    <div className="carousel" style={carouselStyle}>
                        {Array.from({ length: 15 }, (_, i) => (
                            <div 
                                className="carousel-item" 
                                key={i}
                                style={carouselItemStyle}
                                onClick={() => window.location.href = `/product/${i + 1}`}
                            >
                                <div className="card bg-white shadow-lg rounded">
                                    <img 
                                        src={`https://placeimg.com/640/480/tech/${i}`} 
                                        alt={`Game ${i + 1}`} 
                                        className="w-full h-auto rounded-t"
                                    />
                                    <div className="p-4">
                                        <h5 className="text-lg font-bold">Game {i + 1}</h5>
                                        <p>Click to see more about this game.</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    export default App;
