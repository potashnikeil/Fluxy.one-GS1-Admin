import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';

/**
 * @typedef {Object} ProductResponse
 * @property {string} gtin13
 * @property {string} product_name
 * @property {string} status
 * @property {string} customer_code
 * @property {string} entity
 * @property {string[]} languages
 * @property {Object.<string, Object.<string, PropertyValue>>} values - Значения свойств, сгруппированные по языкам и категориям
 * @property {Object.<string, Category>} categories - Метаданные категорий
 */

/**
 * @typedef {Object} PropertyValue
 * @property {any} value - Значение свойства
 * @property {string} data_format - Формат данных (string, number, boolean, date)
 */

/**
 * @typedef {Object} Category
 * @property {string} name - Название категории
 * @property {string} description - Описание категории
 * @property {number} priority - Приоритет для сортировки
 * @property {Object.<string, Property>} properties - Свойства категории
 */

/**
 * @typedef {Object} Property
 * @property {string} name - Название свойства
 * @property {string} description - Описание свойства
 * @property {number} priority - Приоритет для сортировки
 * @property {string} data_format - Формат данных
 */

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const { gtin } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  // Состояние для показа/скрытия debug-блока
  const [showDebug, setShowDebug] = useState(false);

  const getAvailableLanguages = (productData) => {
    if (!productData?.languages || !Array.isArray(productData.languages)) {
      return ['eng'];
    }
    return productData.languages;
  };

  const getQRCodePaths = () => {
    const gtin = product?.product?.gtin13;
    const png = product?.product?.qr_codes_png;
    const svg = product?.product?.qr_codes_svg;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return {
      png: png ? `${baseUrl}${png}` : null,
      svg: svg ? `${baseUrl}${svg}` : null,
    };
  };

  const getGS1Links = () => {
    const gtin = product?.product?.gtin13;
    if (!gtin) return [];
    const baseUrl = 'https://id.fluxy.one';
    return [
      {
        title: 'Digital Link URI',
        description: 'Standard GS1 Digital Link URI format',
        url: `${baseUrl}/01/${gtin}`
      },
      {
        title: 'Web URI',
        description: 'Web URI format for GTIN',
        url: `${baseUrl}/gtin/${gtin}`
      },
      {
        title: 'JSON-LD Context',
        description: 'JSON-LD context for structured data',
        url: `${baseUrl}/gtin/${gtin}?format=jsonld`
      },
      {
        title: 'GS1 Product Page',
        description: 'Product page on GS1 Registry Platform',
        url: `https://gepir.gs1.org/index.php/search-by-gtin?gtin=${gtin}`
      },
      {
        title: 'GS1 Verify Link',
        description: 'Verify GTIN in GS1 database',
        url: `https://www.gs1.org/services/verify/gtin/${gtin}`
      }
    ];
  };

  // Функция для получения полного URL больше не нужна, так как пути уже полные
  const getFullQrUrl = (path) => {
    if (!path) return '';
    return path; // Путь уже полный, включая baseUrl
  };

  // Новый способ загрузки данных продукта
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/products/${gtin}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Ошибка при получении данных продукта');
        }
        const data = await response.json();
        if (!data) {
          throw new Error('Продукт не найден');
        }
        setProduct(data);
        if (data.languages?.length > 0) {
          setSelectedLanguage(data.languages[0]);
        }
      } catch (err) {
        setError(err.message || 'Произошла ошибка при загрузке продукта');
        if (toast.current) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Произошла ошибка при загрузке продукта',
            life: 3000
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (gtin) {
      loadProduct();
    } else {
      setError('GTIN не указан');
      setLoading(false);
    }
  }, [gtin]);

  // Отладочный эффект для отслеживания изменений product и selectedLanguage
  useEffect(() => {
    if (product) {
      console.log('Current product state:', product);
      console.log('Selected language:', selectedLanguage);
      console.log('Available values for selected language:', product.values?.[selectedLanguage]);
      console.log('Categories:', product.categories);
    }
  }, [product, selectedLanguage]);

  // Получаем доступные языки из данных продукта
  const availableLanguages = product?.languages || ['eng'];

  // Обновляем selectedLanguage при изменении product
  useEffect(() => {
    if (product?.languages?.length > 0) {
      setSelectedLanguage(product.languages[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Toast ref={toast} />
        <Card className="p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="mb-4">{error}</p>
            <Button 
              label="Back to List" 
              icon="pi pi-arrow-left"
              onClick={() => navigate('/admin/products')}
            />
          </div>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4">
        <Toast ref={toast} />
        <Card className="p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
            <Button 
              label="Back to List" 
              icon="pi pi-arrow-left"
              onClick={() => navigate('/admin/products')}
            />
          </div>
        </Card>
      </div>
    );
  }

  const getPropertyValue = (propertyKey) => {
    try {
      const propertyData = product?.values?.[selectedLanguage]?.[propertyKey];
      if (!propertyData) {
        console.log(`No data found for property ${propertyKey} in language ${selectedLanguage}`);
        return undefined;
      }
      console.log(`Property ${propertyKey} data:`, propertyData);
      return propertyData.value;
    } catch (error) {
      console.error(`Error getting value for property ${propertyKey}:`, error);
      return undefined;
    }
  };

  const getPropertyFormat = (property) => {
    if (!product?.values?.[selectedLanguage]?.[property]) {
      return null;
    }
    return product.values[selectedLanguage][property].data_format;
  };

  const formatPropertyValue = (value, format) => {
    if (value === null || value === undefined) {
      return 'Not specified';
    }

    try {
      switch (format) {
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'number':
          return typeof value === 'number' ? value.toLocaleString() : value.toString();
        case 'boolean':
          return value ? 'Yes' : 'No';
        case 'string':
        default:
          return String(value);
      }
    } catch (error) {
      console.error('Error formatting property value:', error);
      return 'Format error';
    }
  };

  const getPropertyName = (propertyKey, categoryKey) => {
    try {
      const propertyConfig = product?.categories?.[categoryKey]?.properties?.[propertyKey];
      if (propertyConfig?.name) {
        return propertyConfig.name;
      }
      
      return propertyKey;
    } catch (error) {
      console.error('Error getting property name:', error);
      return propertyKey;
    }
  };

  const getCategoryName = (categoryKey) => {
    try {
      const category = product?.categories?.[categoryKey];
      if (category?.name) {
        return category.name;
      }
      return categoryKey;
    } catch (error) {
      console.error('Error getting category name:', error);
      return categoryKey;
    }
  };

  const getPropertyGroups = () => {
    if (!product?.values?.[selectedLanguage]) {
      console.log('Missing values for language:', selectedLanguage);
      return {};
    }

    try {
      const groups = {};
      const languageValues = product.values[selectedLanguage];
      
      // Перебираем все категории
      Object.entries(product.categories || {}).forEach(([categoryKey, categoryConfig]) => {
        const properties = [];
        
        // Получаем значения для текущей категории
        const categoryValues = languageValues[categoryKey] || {};
        
        // Перебираем свойства категории
        Object.entries(categoryConfig.properties || {}).forEach(([propertyKey, propertyConfig]) => {
          const propertyValue = categoryValues[propertyKey];
          
          if (propertyValue?.value !== undefined) {
            properties.push({
              key: propertyKey,
              name: propertyConfig.description || propertyConfig.name || propertyKey,
              value: propertyValue.value,
              format: propertyValue.data_format || propertyConfig.data_format || 'string',
              priority: propertyConfig.priority || 0
            });
          }
        });

        if (properties.length > 0) {
          // Сортируем свойства по приоритету (меньшее значение = выше в списке)
          properties.sort((a, b) => (a.priority || 0) - (b.priority || 0));
          
          groups[categoryKey] = {
            title: categoryConfig.description || categoryConfig.name || categoryKey,
            priority: categoryConfig.priority || 0,
            properties
          };
        }
      });

      // Сортируем категории по приоритету (меньшее значение = выше в списке)
      const sortedGroups = {};
      Object.entries(groups)
        .sort(([, a], [, b]) => (a.priority || 0) - (b.priority || 0))
        .forEach(([key, group]) => {
          sortedGroups[key] = group;
        });

      console.log('Sorted groups:', sortedGroups); // Добавляем для отладки
      return sortedGroups;
    } catch (error) {
      console.error('Error in getPropertyGroups:', error);
      return {};
    }
  };

  const renderPropertyValue = (property) => {
    if (!property || (property.value === undefined && property.value !== null)) {
      return <div className="property-value text-gray-400 italic text-sm">Not specified</div>;
    }
    
    try {
      const value = formatPropertyValue(property.value, property.format);
      return (
        <div className="property-value text-xl font-semibold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">
          {value}
        </div>
      );
    } catch (error) {
      console.error('Error rendering property value:', error);
      return <div className="property-value text-red-500 bg-red-50 px-3 py-2 rounded-lg">Format error</div>;
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <Card title="Product Details" className="p-4">
        <div className="flex justify-end mb-4">
          {availableLanguages.length > 0 && (
            <Dropdown
              value={selectedLanguage}
              options={availableLanguages.map(code => ({ label: code.toUpperCase(), value: code }))}
              onChange={(e) => setSelectedLanguage(e.value)}
              optionLabel="label"
              placeholder="Select language"
              className="w-48"
            />
          )}
        </div>

        {/* General product information */}
        {(product?.product || product) && (
          <div className="border rounded-lg p-4 mb-6 bg-white">
            <h3 className="text-xl font-bold mb-4 text-gray-800">General Information</h3>
            <table className="min-w-full text-sm">
              <tbody>
                {Object.entries(product?.product || product).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 pr-4 font-medium text-gray-600">{key}</td>
                    <td className="py-2 text-gray-900">
                      {Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'object' && value !== null
                          ? <pre className="bg-gray-50 p-1 rounded">{JSON.stringify(value, null, 2)}</pre>
                          : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Debug button */}
        <div className="mb-4">
          <Button
            label={showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            icon={showDebug ? 'pi pi-eye-slash' : 'pi pi-eye'}
            className="p-button-sm p-button-text"
            onClick={() => setShowDebug((v) => !v)}
          />
        </div>
        {/* Debug Info — по умолчанию скрыт */}
        {showDebug && (
          <div className="bg-gray-100 p-4 rounded mb-6">
            <h4 className="font-bold">Debug Info:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        )}

        {/* Характеристики по категориям и свойствам (GS1-структура) */}
        {product.values && product.categories && (
          Object.entries(product.values[selectedLanguage] || {})
            .sort(([catA], [catB]) => {
              const prioA = product.categories[catA]?.priority ?? 0;
              const prioB = product.categories[catB]?.priority ?? 0;
              return prioA - prioB;
            })
            .map(([categoryKey, properties]) => {
              const categoryMeta = product.categories[categoryKey];
              return (
                <div key={categoryKey} className="border rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    {categoryMeta?.description || categoryMeta?.name || categoryKey}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(properties)
                      .sort(([propA], [propB]) => {
                        const prioA = categoryMeta?.properties?.[propA]?.priority ?? 0;
                        const prioB = categoryMeta?.properties?.[propB]?.priority ?? 0;
                        return prioA - prioB;
                      })
                      .map(([propertyKey, propertyValue]) => {
                        const propMeta = categoryMeta?.properties?.[propertyKey];
                        return (
                          <div key={propertyKey} className="flex flex-col mb-2">
                            <span className="text-sm font-medium text-gray-600 mb-1">
                              {propMeta?.description || propMeta?.name || propertyKey}
                            </span>
                            <span className="text-lg text-gray-900">
                              {propertyValue?.value ?? <span className="text-gray-400">Not specified</span>}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })
        )}

        {/* QR-коды */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800">QR Codes</h3>
          
          {/* Отладочная информация - закомментирована */}
          {/* <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
            <h4 className="font-bold text-yellow-800 mb-2">Отладочная информация:</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold">GTIN продукта:</p>
                <p className="font-mono bg-white p-2 rounded">{product?.product?.gtin13 || 'не определен'}</p>
              </div>
              <div>
                <p className="font-semibold">Данные загружены:</p>
                <p className="font-mono bg-white p-2 rounded">{product ? 'да' : 'нет'}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="font-semibold">Пути к QR-кодам:</p>
              <pre className="font-mono bg-white p-2 rounded text-sm overflow-auto">
                {JSON.stringify(getQRCodePaths())}
              </pre>
            </div>
            <div>
              <p className="font-semibold">Структура данных продукта:</p>
              <pre className="font-mono bg-white p-2 rounded text-sm overflow-auto">
                {JSON.stringify({
                  productFields: product ? Object.keys(product) : 'нет данных',
                  productData: product || 'нет данных'
                }, null, 2)}
              </pre>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PNG QR-код */}
            <div className="flex flex-col items-center">
              <h4 className="text-sm font-medium text-gray-600 mb-2">PNG Format</h4>
              <div className="relative w-48 h-48 border rounded-lg p-2 bg-white">
                <img 
                  src={getQRCodePaths()?.png}
                  alt="QR Code PNG" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Error loading PNG QR code');
                    e.target.style.display = 'none';
                    toast.current.show({
                      severity: 'error',
                      summary: 'Error',
                      detail: 'Failed to load PNG QR code',
                      life: 3000
                    });
                  }}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  label="Download PNG" 
                  icon="pi pi-download"
                  className="p-button-outlined"
                  onClick={() => {
                    const paths = getQRCodePaths();
                    if (paths?.png) {
                      const a = document.createElement('a');
                      a.href = getFullQrUrl(paths.png);
                      a.download = `qr-${product?.product?.gtin13}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }}
                />
                <Button
                  icon="pi pi-eye"
                  className="p-button-outlined"
                  onClick={() => window.open(getFullQrUrl(getQRCodePaths()?.png), '_blank')}
                  tooltip="Open in new tab"
                />
              </div>
            </div>

            {/* SVG QR-код */}
            <div className="flex flex-col items-center">
              <h4 className="text-sm font-medium text-gray-600 mb-2">SVG Format</h4>
              <div className="relative w-48 h-48 border rounded-lg p-2 bg-white">
                <img 
                  src={getQRCodePaths()?.svg}
                  alt="QR Code SVG" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('Error loading SVG QR code');
                    e.target.style.display = 'none';
                    toast.current.show({
                      severity: 'error',
                      summary: 'Error',
                      detail: 'Failed to load SVG QR code',
                      life: 3000
                    });
                  }}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  label="Download SVG" 
                  icon="pi pi-download"
                  className="p-button-outlined"
                  onClick={() => {
                    const paths = getQRCodePaths();
                    if (paths?.svg) {
                      const a = document.createElement('a');
                      a.href = getFullQrUrl(paths.svg);
                      a.download = `qr-${product?.product?.gtin13}.svg`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }}
                />
                <Button
                  icon="pi pi-eye"
                  className="p-button-outlined"
                  onClick={() => window.open(getFullQrUrl(getQRCodePaths()?.svg), '_blank')}
                  tooltip="Open in new tab"
                />
              </div>
            </div>
          </div>

          {/* Информация о QR-кодах */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code Information:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>PNG format is suitable for most use cases</li>
              <li>SVG format provides better quality when scaling</li>
              <li>Both formats contain the same scanning information</li>
            </ul>
          </div>
        </div>

        {/* GS1 Ссылки */}
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-bold mb-4 text-gray-800">GS1 Links</h3>
          <div className="space-y-6">
            {product && getGS1Links().map((link, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-1">{link.title}</span>
                <span className="text-xs text-gray-500">{link.description}</span>
                <a 
                  href={link.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 text-lg font-medium text-blue-600 hover:text-blue-800 break-all bg-blue-50 px-3 py-2 rounded-lg"
                >
                  {link.url}
                </a>
                <div className="mt-4 border-b border-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetails; 