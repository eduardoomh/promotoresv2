'use client'
import React, { FC } from 'react';
import { Table, Tooltip, Avatar } from 'antd';
import moment from 'moment';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { IMovementSchema } from '@/models/Movement';

interface Props {
    movements: IMovementSchema[];
}

const MovementsTable: FC<Props> = ({ movements }) => {
    const router = useRouter()

    const handleActionClick = (_id: string) => {
        router.push(`/movimientos?action=${_id}`);
    };

    const columns = [
        {
            title: 'Nombre',
            render: (data: any) =>
                <>
                    <Avatar
                        style={{
                            backgroundColor: '#528FA9',
                            verticalAlign: 'middle',
                            marginRight: '0.4rem'
                        }}
                        size='default'
                        gap={1}>
                        {data.user.name[0].toUpperCase()}
                    </Avatar>
                    {data.user.name}
                </>
        },
        {
            title: 'Cantidad',
            render: (data: any) => <a>${data.amount} mxn</a>,
        },
        {
            title: 'Saldo anterior',
            render: (data: any) => <a>${data.security.before_mod} mxn</a>,
        },
        {
            title: 'Saldo posterior',
            render: (data: any) => <a>${data.security.after_mod} mxn</a>,
        },
        {
            title: 'Fecha',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => moment(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Acciones',
            render: (data: any) => (
                <div className='flex gap-3'>
                    <Tooltip placement="top" title={'Ver más información'}>
                        <InfoCircleOutlined
                            style={{ fontSize: '1.6rem', color: '#0D709A' }}
                            onClick={() => handleActionClick(data._id)} />
                    </Tooltip>

                </div>
            ),
        },
    ];


    return (
        <>
            <Table columns={columns} dataSource={movements} style={{ border: '1px solid #E6E6E6' }} />
        </>
    );
};

export default MovementsTable;