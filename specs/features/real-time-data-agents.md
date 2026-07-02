# Feature Specification: Real-Time Data Collection Agents

**Feature ID**: FR-2.1  
**Status**: Proposed  
**Priority**: High  
**Created**: 2026-07-02  
**Related Features**: FR-1.6 (Agentic Decision Workflow)

---

## 1. Overview

### 1.1 Objetivo
Mejorar DecisionHub AI para obtener información en tiempo real de fuentes externas confiables, reemplazando los datos mockeados con información actualizada sobre vehículos, precios, reviews y calificaciones de seguridad.

### 1.2 Motivación
- **Datos Actualizados**: Información de precios y disponibilidad en tiempo real
- **Credibilidad**: Reviews profesionales de Consumer Reports, Edmunds, Kelley Blue Book
- **Mercado Local**: Precios reales del mercado colombiano (TuCarro, OLX, Mercado Libre)
- **Decisiones Informadas**: Recomendaciones basadas en datos reales y actualizados

### 1.3 Alcance
- ✅ Agente de Reviews Profesionales (Consumer Reports, Edmunds)
- ✅ Agente de Precios Locales (TuCarro, OLX, Mercado Libre Colombia)
- ✅ Agente de Seguridad (NHTSA, IIHS, Latin NCAP)
- ✅ Integración con el Lead Decision Agent existente
- ✅ Sistema de caché para optimizar peticiones
- ❌ Web scraping agresivo (respetamos robots.txt)
- ❌ Almacenamiento permanente de datos externos

---

## 2. User Stories

### US-2.1.1: Búsqueda de Reviews Profesionales
**Como** usuario de DecisionHub AI  
**Quiero** ver reviews profesionales de expertos automotrices  
**Para** tomar decisiones informadas basadas en evaluaciones confiables

**Criterios de Aceptación:**
- [ ] AC-1: Sistema obtiene reviews de Consumer Reports
- [ ] AC-2: Sistema obtiene reviews de Edmunds y Kelley Blue Book
- [ ] AC-3: Reviews incluyen calificaciones numéricas y comentarios
- [ ] AC-4: Se muestran pros y cons de cada fuente
- [ ] AC-5: Timeout de 10 segundos por fuente

### US-2.1.2: Búsqueda de Precios Reales
**Como** usuario interesado en comprar un vehículo  
**Quiero** ver precios reales del mercado colombiano  
**Para** conocer el rango de precios actual y negociar mejor

**Criterios de Aceptación:**
- [ ] AC-1: Sistema busca en TuCarro.com
- [ ] AC-2: Sistema busca en OLX Colombia
- [ ] AC-3: Sistema busca en Mercado Libre Colombia
- [ ] AC-4: Se muestra rango de precios (min, max, promedio)
- [ ] AC-5: Se indica el número de anuncios encontrados
- [ ] AC-6: Precios en COP con formato local

### US-2.1.3: Información de Seguridad Actualizada
**Como** usuario preocupado por la seguridad  
**Quiero** ver calificaciones oficiales de seguridad  
**Para** elegir vehículos con altos estándares de protección

**Criterios de Aceptación:**
- [ ] AC-1: Obtiene calificaciones de NHTSA (USA)
- [ ] AC-2: Obtiene calificaciones de IIHS
- [ ] AC-3: Obtiene calificaciones de Latin NCAP
- [ ] AC-4: Muestra estrellas y categorías (adult, child, pedestrian)
- [ ] AC-5: Indica año del test

---

## 3. Arquitectura Técnica

### 3.1 Nuevos Agentes

#### 3.1.1 ReviewsAgent
**Responsabilidad**: Buscar y consolidar reviews profesionales

**Fuentes de Datos:**
- Consumer Reports API (si disponible) o web scraping
- Edmunds API
- Kelley Blue Book

**Output:**
```typescript
interface ReviewData {
  source: string;
  rating: number; // 0-10
  pros: string[];
  cons: string[];
  summary: string;
  url: string;
  lastUpdated: Date;
}
```

#### 3.1.2 PricingAgent
**Responsabilidad**: Buscar precios en mercado colombiano

**Fuentes de Datos:**
- TuCarro.com (web scraping)
- OLX Colombia API
- Mercado Libre API

**Output:**
```typescript
interface PricingData {
  source: string;
  listings: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
    currency: 'COP';
  };
  year: number;
  condition: 'new' | 'used';
  locations: string[];
}
```

#### 3.1.3 SafetyAgent
**Responsabilidad**: Obtener calificaciones oficiales de seguridad

**Fuentes de Datos:**
- NHTSA API (USA)
- IIHS web data
- Latin NCAP database

**Output:**
```typescript
interface SafetyData {
  source: string;
  overallRating: number; // 1-5 stars
  categories: {
    adultOccupant?: number;
    childOccupant?: number;
    pedestrian?: number;
    safetyAssist?: number;
  };
  testYear: number;
  vehicleYear: number;
  crashTestVideos?: string[];
}
```

### 3.2 Modificaciones a Agentes Existentes

#### Lead Decision Agent Enhancement
**Cambios necesarios:**
- Integrar datos de ReviewsAgent en el reasoning
- Considerar PricingAgent para validar budget realista
- Usar SafetyAgent para priorizar seguridad
- Generar comparativa entre datos reales vs esperados

```typescript
interface EnhancedDecisionInput {
  query: string;
  topRecommendations: CarRecommendation[];
  realTimeData: {
    reviews: ReviewData[];
    pricing: PricingData[];
    safety: SafetyData[];
  };
}
```

---

## 4. Flujo de Trabajo

### 4.1 Diagrama de Secuencia
```
User Query
    ↓
IntentAgent (sin cambios)
    ↓
ResearchAgent (sin cambios)
    ↓
EvaluationAgent (sin cambios)
    ↓
[NUEVO] RealTimeDataOrchestrator
    ├→ ReviewsAgent (parallel)
    ├→ PricingAgent (parallel)
    └→ SafetyAgent (parallel)
    ↓
LeadDecisionAgent (enhanced)
    ↓
FinalRecommendationAgent (sin cambios)
```

### 4.2 Orquestador de Datos en Tiempo Real
```typescript
class RealTimeDataOrchestrator extends BaseAgent {
  async execute(vehicles: Car[]): Promise<RealTimeDataBundle> {
    const reviewsAgent = new ReviewsAgent();
    const pricingAgent = new PricingAgent();
    const safetyAgent = new SafetyAgent();

    // Ejecutar en paralelo con timeout
    const [reviews, pricing, safety] = await Promise.allSettled([
      reviewsAgent.execute(vehicles).timeout(10000),
      pricingAgent.execute(vehicles).timeout(10000),
      safetyAgent.execute(vehicles).timeout(10000),
    ]);

    return {
      reviews: reviews.status === 'fulfilled' ? reviews.value : [],
      pricing: pricing.status === 'fulfilled' ? pricing.value : [],
      safety: safety.status === 'fulfilled' ? safety.value : [],
      dataQuality: this.calculateDataQuality(reviews, pricing, safety),
    };
  }
}
```

---

## 5. Implementación Técnica

### 5.1 Stack Tecnológico

**Web Scraping:**
- `cheerio` - Parsing HTML
- `axios` - HTTP requests
- `puppeteer` - Para sitios con JavaScript (si necesario)

**APIs:**
- NHTSA API oficial (https://api.nhtsa.gov)
- Mercado Libre API (https://developers.mercadolibre.com)
- Edmunds API (si disponible)

**Caché:**
- `node-cache` - Caché en memoria
- TTL: 24 horas para reviews, 2 horas para precios

**Rate Limiting:**
- `bottleneck` - Control de requests
- Max 10 requests/minuto por fuente

### 5.2 Estructura de Archivos
```
packages/api/src/
├── agents/
│   ├── realtime/
│   │   ├── ReviewsAgent.ts
│   │   ├── PricingAgent.ts
│   │   ├── SafetyAgent.ts
│   │   └── RealTimeDataOrchestrator.ts
│   └── LeadDecisionAgent.ts (modificado)
├── services/
│   ├── scraping/
│   │   ├── tuCarroScraper.ts
│   │   ├── olxScraper.ts
│   │   └── consumerReportsScraper.ts
│   ├── apis/
│   │   ├── nhtsaClient.ts
│   │   ├── mercadoLibreClient.ts
│   │   └── edmundsClient.ts
│   └── cache/
│       └── dataCache.ts
```

---

## 6. Configuración y Variables de Entorno

### 6.1 Variables Requeridas
```bash
# APIs
MERCADOLIBRE_APP_ID=your_app_id
MERCADOLIBRE_SECRET_KEY=your_secret

# Opcionales
EDMUNDS_API_KEY=your_key
CONSUMER_REPORTS_API_KEY=your_key

# Configuración
ENABLE_REAL_TIME_DATA=true
REAL_TIME_TIMEOUT=10000
CACHE_TTL_REVIEWS=86400 # 24 horas
CACHE_TTL_PRICING=7200  # 2 horas
```

---

## 7. Manejo de Errores

### 7.1 Estrategias de Fallback
1. **Timeout**: Si una fuente no responde en 10s, continuar sin esos datos
2. **404/No Data**: Mostrar mensaje informativo al usuario
3. **Rate Limit**: Usar caché y notificar reintento
4. **Partial Data**: Trabajar con datos parciales disponibles

### 7.2 Mensajes al Usuario
```typescript
interface DataAvailability {
  reviews: 'available' | 'partial' | 'unavailable';
  pricing: 'available' | 'partial' | 'unavailable';
  safety: 'available' | 'partial' | 'unavailable';
  message: string;
}

// Ejemplo:
{
  reviews: 'partial',
  pricing: 'available',
  safety: 'unavailable',
  message: 'Mostrando precios actualizados. Reviews parciales de 2/3 fuentes. Datos de seguridad no disponibles para este modelo.'
}
```

---

## 8. Testing

### 8.1 Unit Tests Requeridos
- [ ] ReviewsAgent con mock de Consumer Reports
- [ ] PricingAgent con mock de TuCarro
- [ ] SafetyAgent con mock de NHTSA
- [ ] RealTimeDataOrchestrator con timeout scenarios
- [ ] Enhanced LeadDecisionAgent con datos reales

### 8.2 Integration Tests
- [ ] Flujo completo con datos reales
- [ ] Manejo de timeouts
- [ ] Caché funcionando correctamente
- [ ] Rate limiting respetado

---

## 9. UI/UX Changes

### 9.1 Indicadores de Datos Reales
```tsx
<DataSourceBadge>
  <Icon>🔄</Icon>
  <Text>Actualizado hoy</Text>
</DataSourceBadge>

<PriceRange>
  <Label>Rango de Precio Real (TuCarro)</Label>
  <Value>$95M - $105M COP</Value>
  <SubText>Basado en 12 anuncios</SubText>
</PriceRange>
```

### 9.2 Sección de Reviews
```tsx
<ReviewsSection>
  <ReviewCard source="Consumer Reports" rating={8.5} />
  <ReviewCard source="Edmunds" rating={4.2} />
  <ReviewCard source="Kelley Blue Book" rating={8.8} />
</ReviewsSection>
```

---

## 10. Consideraciones Legales y Éticas

### 10.1 Web Scraping
- ✅ Respetar `robots.txt`
- ✅ Rate limiting adecuado
- ✅ User-Agent identificable
- ✅ No sobrecargar servidores
- ✅ Citar fuentes claramente

### 10.2 Términos de Uso
- Revisar términos de servicio de cada sitio
- No almacenar datos permanentemente
- Caché solo por tiempo razonable
- Enlazar a fuentes originales

---

## 11. Roadmap de Implementación

### Phase 1: Infrastructure (Semana 1)
- [ ] Configurar scrapers básicos
- [ ] Implementar sistema de caché
- [ ] Configurar rate limiting
- [ ] Tests unitarios de scrapers

### Phase 2: Agents (Semana 2)
- [ ] Implementar ReviewsAgent
- [ ] Implementar PricingAgent
- [ ] Implementar SafetyAgent
- [ ] Tests unitarios de agentes

### Phase 3: Integration (Semana 3)
- [ ] RealTimeDataOrchestrator
- [ ] Modificar LeadDecisionAgent
- [ ] Integration tests
- [ ] Performance optimization

### Phase 4: UI/UX (Semana 4)
- [ ] Componentes de visualización
- [ ] Indicadores de datos reales
- [ ] Manejo de estados de carga
- [ ] Testing end-to-end

---

## 12. Métricas de Éxito

### 12.1 KPIs Técnicos
- Success rate de data fetching > 90%
- Response time < 15 segundos total
- Cache hit rate > 70%
- Zero rate limit violations

### 12.2 KPIs de Usuario
- Satisfacción con precisión de precios > 4.5/5
- Confianza en recomendaciones > 80%
- Uso de enlaces a fuentes > 40%

---

## 13. Referencias

### 13.1 APIs Públicas
- NHTSA: https://api.nhtsa.gov/
- Mercado Libre: https://developers.mercadolibre.com/
- Latin NCAP: https://www.latinncap.com/

### 13.2 Documentación
- Web Scraping Best Practices
- robots.txt specification
- Rate Limiting patterns
