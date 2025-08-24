import { Droppable, Draggable } from '@hello-pangea/dnd';
import { StatusBadge } from '../../components/common/badges/StatusBadge';

const DraggableColumn = ({ status, inquiries, columnId, ticketStatusColors, onInquiryClick }) => {
  return (
    <div className="flex flex-col min-w-[280px] bg-[var(--color-bg)] rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>
        {status}
      </h2>
      <Droppable droppableId={columnId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4 min-h-[300px]"
          >
            {inquiries.map((inq, index) => (
              <Draggable key={inq.id} draggableId={String(inq.id)} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    style={{
                      ...provided.draggableProps.style,
                      borderLeft: `5px solid ${ticketStatusColors[inq.status.toLowerCase()].bg}`,
                    }}
                    onClick={() => onInquiryClick(inq)} // Open the modal on click
                  >
                    <h3 className="font-medium text-lg text-ellipsis overflow-hidden whitespace-nowrap">{inq.title}</h3>
                    <p className="text-sm mb-1 text-ellipsis overflow-hidden whitespace-nowrap">{inq.body}</p>
                    <div className="text-xs text-gray-600 mb-1">
                      Category: <strong>{inq.category}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>From: <strong>{inq.sender}</strong></span>
                      <span>{inq.date}</span>
                    </div>
                    {inq.attachments?.length > 0 && (
                      <div className="text-xs mb-1">
                        Attachments: {inq.attachments.join(', ')}
                      </div>
                    )}
                    <StatusBadge value={inq.status} colorMap={ticketStatusColors} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DraggableColumn;
