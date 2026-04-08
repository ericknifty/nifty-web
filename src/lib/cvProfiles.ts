export interface CvExperienceItem {
  role: string;
  organization: string;
  period: string;
  bullets: string[];
}

export interface CvToolGroup {
  label: string;
  items: string[];
}

export interface CvProfile {
  id: string;
  tabLabel: string;
  title: string;
  summary: string;
  profile: string;
  experience: CvExperienceItem[];
  tools: CvToolGroup[];
}

export const cvProfiles: CvProfile[] = [
  {
    id: "motion",
    tabLabel: "Motion Designer",
    title: "CV A: Motion Graphics B2B y E-learning",
    summary: "Perfil enfocado en motion graphics, aprendizaje corporativo y comunicación audiovisual técnica.",
    profile:
      "Desarrollador Multimedia y Motion Designer B2B especializado en traducir información técnica, corporativa y educativa en piezas animadas de alto impacto. Enfocado en motion graphics 2D, diseño instruccional visual y desarrollo de contenidos E-learning, con capacidad para interpretar guiones complejos y convertirlos en soluciones visuales claras para capacitación corporativa, inducción y ventas B2B.",
    experience: [
      {
        role: "Desarrollador Multimedia B2B",
        organization: "Independiente / Tiaxa / Euroglass",
        period: "2019 - Presente",
        bullets: [
          "Desarrollo de infografías animadas complejas para sectores tecnológicos y mineros, incluyendo piezas híbridas para imprenta y video FHD 18:9.",
          "Animación de videos corporativos sobre seguridad industrial y control solar, con foco en claridad técnica y retención de atención."
        ]
      },
      {
        role: "Animador y Desarrollador E-learning",
        organization: "MT Audiovisual",
        period: "2019",
        bullets: [
          "Transformación de guiones e información técnica en módulos de aprendizaje interactivos.",
          "Diseño de arquitectura visual, timing y animación integral para plataformas de educación corporativa."
        ]
      },
      {
        role: "Productor de Material Instruccional",
        organization: "G&R Limitada",
        period: "2023 - 2024",
        bullets: [
          "Producción, grabación y edición audiovisual de video-tutoriales técnicos sobre mantenimiento y operación de maquinaria industrial."
        ]
      },
      {
        role: "Desarrollador de Formatos Especiales",
        organization: "Planetario USACH",
        period: "2017",
        bullets: [
          "Desarrollo de proyectos audiovisuales en formatos no convencionales como FullDome y aplicación de VFX para divulgación científica."
        ]
      }
    ],
    tools: [
      {
        label: "Animación y Postproducción",
        items: ["Adobe After Effects (Avanzado)", "Adobe Premiere Pro"]
      },
      {
        label: "Audio y Diseño Sonoro",
        items: ["Adobe Audition", "Limpieza de locuciones", "Sonorización"]
      },
      {
        label: "Diseño Vectorial y UI",
        items: ["Adobe Illustrator", "Adobe Photoshop"]
      }
    ]
  },
  {
    id: "print",
    tabLabel: "Producción Gráfica",
    title: "CV B: Producción Gráfica e Industrial",
    summary: "Perfil orientado a pre-prensa, flujos industriales, operación de maquinaria y asesoría técnica B2B.",
    profile:
      "Especialista en Producción Gráfica con experiencia en dirección de procesos a nivel industrial y comercial. Enfocado en pre-prensa, operación de maquinaria de alto volumen y automatización de tirajes. Combina rigor técnico de taller con capacidad de asesoría comercial B2B, asegurando control de calidad desde la recepción del archivo hasta la entrega final.",
    experience: [
      {
        role: "Especialista en Producción Gráfica, Preventa y Automatización",
        organization: "G&R Limitada",
        period: "2023 - 2024",
        bullets: [
          "Calibración y mantenimiento preventivo de equipos industriales como plotter ecosolvente Xenons Pro, cama plana UV Xenons Compact y plotter de corte Studio.",
          "Operación de Canon imageRunner 7565i para producción de alto volumen.",
          "Manejo avanzado de software RIP como Flexi SAi y Signmaster, además de creación de Spot Colors para impresión UV.",
          "Conducción de demostraciones técnicas B2B y automatización de flujos CRM mediante correos HTML."
        ]
      },
      {
        role: "Encargado de Producción Gráfica y Pre-prensa",
        organization: "Gráfica Era",
        period: "2019 - Presente",
        bullets: [
          "Liderazgo del flujo de trabajo, revisión técnica y optimización de archivos para asegurar estándares de impresión.",
          "Manejo avanzado de impresión de datos variables (Print Merge) para documentos personalizados en alto volumen.",
          "Operación de Xerox C8035, Silhouette Cameo 4 y control de calidad en terminaciones."
        ]
      },
      {
        role: "Productor Gráfico y Textil",
        organization: "Proyectos Independientes",
        period: "2017 - 2022",
        bullets: [
          "Operación de planchas de estampado térmico, sublimación, vinilo textil y DTF para merchandising corporativo.",
          "Preparación de archivos para gran formato y producción textil aplicada."
        ]
      }
    ],
    tools: [
      {
        label: "Software de Producción y RIP",
        items: ["Flexi SAi", "Signmaster", "Artcut", "Silhouette Studio", "Software RIP UV"]
      },
      {
        label: "Suite de Pre-prensa",
        items: ["Corel Draw (Especialista en Datos Variables)", "Adobe Illustrator", "Adobe InDesign", "Adobe Photoshop"]
      }
    ]
  }
];
