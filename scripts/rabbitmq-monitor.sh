#!/bin/bash

# RabbitMQ Monitoring and Maintenance Script
# Usage: ./scripts/rabbitmq-monitor.sh [action]
# Actions: status, memory, queues, connections, cleanup

set -e

CONTAINER_NAME="indie-clock-rabbitmq"
RABBITMQ_ADMIN_USER="${RABBITMQ_ADMIN_USER:-admin}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to run rabbitmq commands
run_rabbitmq_cmd() {
    docker exec -it "$CONTAINER_NAME" rabbitmqctl "$@"
}

# Check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}❌ RabbitMQ container is not running${NC}"
        exit 1
    fi
}

# Show status
show_status() {
    echo -e "${GREEN}🐰 RabbitMQ Status${NC}"
    echo "==================="
    
    echo -e "\n${YELLOW}Node Status:${NC}"
    run_rabbitmq_cmd status
    
    echo -e "\n${YELLOW}Cluster Status:${NC}"
    run_rabbitmq_cmd cluster_status
    
    echo -e "\n${YELLOW}Alarms:${NC}"
    run_rabbitmq_cmd eval 'rabbit_alarm:get_alarms().'
}

# Show memory usage
show_memory() {
    echo -e "${GREEN}💾 Memory Usage${NC}"
    echo "================"
    
    echo -e "\n${YELLOW}Memory Status:${NC}"
    run_rabbitmq_cmd status | grep -E "(memory|disk)"
    
    echo -e "\n${YELLOW}Memory Breakdown:${NC}"
    run_rabbitmq_cmd eval 'rabbit_vm:memory().'
    
    echo -e "\n${YELLOW}Memory High Watermark:${NC}"
    run_rabbitmq_cmd eval 'vm_memory_monitor:get_memory_limit().'
}

# Show queue information
show_queues() {
    echo -e "${GREEN}📋 Queue Information${NC}"
    echo "===================="
    
    echo -e "\n${YELLOW}Queue List:${NC}"
    run_rabbitmq_cmd list_queues name messages consumers memory
    
    echo -e "\n${YELLOW}Queue Totals:${NC}"
    run_rabbitmq_cmd list_queues | wc -l | xargs echo "Total queues:"
}

# Show connections
show_connections() {
    echo -e "${GREEN}🔗 Connection Information${NC}"
    echo "========================="
    
    echo -e "\n${YELLOW}Active Connections:${NC}"
    run_rabbitmq_cmd list_connections name peer_host peer_port state channels
    
    echo -e "\n${YELLOW}Connection Count:${NC}"
    run_rabbitmq_cmd list_connections | wc -l | xargs echo "Total connections:"
    
    echo -e "\n${YELLOW}Failed Login Attempts (last 24h):${NC}"
    docker logs "$CONTAINER_NAME" --since 24h | grep -i "authentication\|login\|credential" | tail -10
}

# Cleanup old queues and messages
cleanup() {
    echo -e "${GREEN}🧹 Cleanup Operations${NC}"
    echo "====================="
    
    echo -e "\n${YELLOW}Purging empty queues...${NC}"
    run_rabbitmq_cmd eval '
        lists:foreach(
            fun({resource, _, _, QueueName}) ->
                case rabbit_amqqueue:lookup({resource, <<"/">>, queue, QueueName}) of
                    {ok, Q} ->
                        case rabbit_amqqueue:info(Q, [messages]) of
                            [{messages, 0}] ->
                                io:format("Deleting empty queue: ~p~n", [QueueName]),
                                rabbit_amqqueue:delete(Q, false, false, <<"cleanup">>);
                            _ -> ok
                        end;
                    _ -> ok
                end
            end,
            rabbit_amqqueue:list()
        ).
    '
    
    echo -e "\n${YELLOW}Memory garbage collection...${NC}"
    run_rabbitmq_cmd eval 'erlang:garbage_collect().'
    
    echo -e "\n${GREEN}✅ Cleanup completed${NC}"
}

# Main script logic
ACTION="${1:-status}"

check_container

case "$ACTION" in
    "status")
        show_status
        ;;
    "memory")
        show_memory
        ;;
    "queues")
        show_queues
        ;;
    "connections")
        show_connections
        ;;
    "cleanup")
        cleanup
        ;;
    "all")
        show_status
        echo -e "\n"
        show_memory
        echo -e "\n"
        show_queues
        echo -e "\n"
        show_connections
        ;;
    *)
        echo "Usage: $0 [status|memory|queues|connections|cleanup|all]"
        echo ""
        echo "Actions:"
        echo "  status      - Show general RabbitMQ status"
        echo "  memory      - Show memory usage details"
        echo "  queues      - Show queue information"
        echo "  connections - Show connection details and failed logins"
        echo "  cleanup     - Clean up empty queues and run garbage collection"
        echo "  all         - Show all information"
        exit 1
        ;;
esac