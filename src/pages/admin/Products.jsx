import React, { useState, useEffect, useRef } from 'react';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      console.log('Полученные данные продуктов:', JSON.stringify(data, null, 2));
      console.log('Структура первого продукта:', JSON.stringify(data[0], null, 2));
      console.log('Поля продукта:', Object.keys(data[0]));
      console.log('Значения полей первого продукта:', Object.entries(data[0]).map(([key, value]) => `${key}: ${value}`));
      setProducts(data);
    } catch (error) {
      console.error('Ошибка при загрузке продуктов:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.message || 'Не удалось загрузить продукты',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (product) => {
    confirmDialog({
      message: `Вы уверены, что хотите удалить продукт "${product.name}"?`,
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      accept: () => handleDelete(product.gtin)
    });
  };

  const handleDelete = async (gtin) => {
    try {
      await deleteProduct(gtin);
      setProducts(products.filter(p => p.gtin !== gtin));
      toast.current.show({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Продукт удален',
        life: 3000
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.message || 'Не удалось удалить продукт',
        life: 3000
      });
    }
  };

  const formatColumnHeader = (fieldName) => {
    const headerMap = {
      product_id: 'ID',
      gtin13: 'GTIN-13',
      product_name: 'Название',
      status: 'Статус',
      customer_name: 'Компания',
      entity: 'Категория'
    };
    return headerMap[fieldName] || fieldName;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${rowData.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {rowData.status ? 'Активен' : 'Неактивен'}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-external-link"
          className="p-button-rounded p-button-secondary p-button-sm"
          onClick={() => window.open(`/products/${rowData.gtin13}`, '_blank')}
          tooltip="Открыть публичную страницу"
        />
        <Button
          icon="pi pi-list"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => navigate(`/admin/products/${rowData.gtin13}`)}
          tooltip="Детальное описание"
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => navigate(`/admin/products/edit/${rowData.gtin13}`)}
          tooltip="Редактировать"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Удалить"
        />
      </div>
    );
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Все продукты</h2>
      <div className="flex gap-3 items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Поиск..."
          />
        </span>
        <Button
          label="Добавить продукт"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => navigate('/admin/products/create')}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <Card>
        <DataTable
          value={products}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          globalFilter={globalFilter}
          header={header}
          emptyMessage="Продукты не найдены"
          className="p-datatable-sm"
          stripedRows
          showGridlines
          responsiveLayout="scroll"
        >
          <Column field="customer_name" header="Компания" sortable style={{ width: '180px' }} />
          <Column field="gtin13" header="GTIN-13" sortable style={{ width: '150px' }} />
          <Column field="product_name" header="Название" sortable style={{ minWidth: '200px' }} />
          <Column field="entity" header="Категория" sortable style={{ width: '150px' }} />
          <Column field="status" header="Статус" body={statusBodyTemplate} sortable style={{ width: '120px' }} />
          <Column
            body={actionBodyTemplate}
            header="Действия"
            style={{ width: '180px' }}
            exportable={false}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default Products;